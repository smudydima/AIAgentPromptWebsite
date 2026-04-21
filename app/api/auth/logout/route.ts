import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashRefreshToken } from "@/lib/auth";


export async function POST() {
  const cookieStore = await cookies();

  // Try to revoke token from database (check both naming conventions)
  const refreshToken = cookieStore.get("refresh_token")?.value ??
                       cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    const hashedToken = hashRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { hashedToken, revoked: false },
      data: { revoked: true },
    })
  }

  // Clear both old (camelCase) and new (snake_case) cookie names
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return Response.json({ success: true }, { status: 200 });
}
