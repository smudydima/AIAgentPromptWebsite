import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashRefreshToken } from "@/lib/auth";


export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    const hashedToken = hashRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { hashedToken, revoked: false },
      data: { revoked: true },
    })
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return Response.json({ success: true }, { status: 200 });
}
