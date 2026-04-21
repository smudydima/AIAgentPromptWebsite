import { prisma } from "@/lib/prisma";
import { hashPassword, createAccessToken, createRefreshToken, hashRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const name = body?.name ? String(body.name).trim() : null;

    if (!email || !password) {
      return Response.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { message: "Длина пароля должна быть не менее 6 символов" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return Response.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const payload = { userId: user.id, email: user.email };
    const accessToken = await createAccessToken(payload);
    const refreshToken = await createRefreshToken(payload);

    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashedRefreshToken,
        userId: user.id,
        expireAt: thirtyDaysFromNow,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return Response.json({ user, redirect: '/my-prompts' }, { status: 201 })
  } catch (error) {
    console.error('Ошибка во время регистрации:', error);
    return Response.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}