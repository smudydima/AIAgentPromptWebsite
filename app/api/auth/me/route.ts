import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";


export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return Response.json({ user: null }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const userId = String(payload.userId ?? "");

    if (!userId) {
      return Response.json({ user: null },{ status: 401 });
    }


    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });


    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json({ user: null }, { status: 401 });
  }
}
