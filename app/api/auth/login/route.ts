import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "@/lib/auth"
import { cookies } from "next/headers"


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const ACCESS_MAX_AGE = 60 * 15
    const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = await createRefreshToken({
      userId: user.id,
      email: user.email,
    });
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashedRefreshToken,
        userId: user.id,
        expireAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });

    
    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
