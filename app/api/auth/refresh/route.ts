import { prisma } from "@/lib/prisma";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";
import { cookies } from "next/headers";


export async function POST() {
  const ACCESS_MAX_AGE = 60 * 15
  const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

  try {
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get("refresh_token")?.value;

    if (!oldRefreshToken) {
      return Response.json({ message: "Refresh token is missing" }, { status: 401 });
    }

    const payload = await verifyRefreshToken(oldRefreshToken);
    const userId = String(payload.userId ?? "");
    const email = String(payload.email ?? "");

    if (!userId || !email) {
      return Response.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    const oldHashedToken = hashRefreshToken(oldRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken: oldHashedToken },
      select: {
        id: true,
        userId: true,
        revoked: true,
        expireAt: true,
      },
    });

    if (
      !storedToken ||
      storedToken.userId !== userId ||
      storedToken.revoked ||
      storedToken.expireAt <= new Date()
    ) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return Response.json({ message: "Refresh token is invalid" }, { status: 401 });
    }

    const newAccessToken = await createAccessToken({ userId, email });
    const newRefreshToken = await createRefreshToken({ userId, email });
    const newHashedToken = hashRefreshToken(newRefreshToken);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          hashedToken: newHashedToken,
          userId,
          expireAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
        },
      }),
    ]);

    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
    cookieStore.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });

    return Response.json({ success: true },{ status: 200 });
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ message: "Invalid refresh token" }, { status: 401 });
  }
}
