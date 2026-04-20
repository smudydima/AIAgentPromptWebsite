import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";


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

    return Response.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Ошибка во время регистрации:', error);
    return Response.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}