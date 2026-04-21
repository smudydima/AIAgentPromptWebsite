import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    let userId: string | undefined;
    if (token) {
        try {
            const payload = await verifyAccessToken(token);
            userId = String(payload.userId ?? "");
        } catch {
            userId = undefined;
        }
    }

    const { title, tags, description, isPrivate } = await req.json();

    const post = await prisma.post.create({
        data: {
            title,
            tags,
            description,
            isPrivate,
            userId: userId || null,
        },
    });

    return Response.json(post);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const visibility = searchParams.get("visibility");

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    let currentUserId: string | undefined;
    if (token) {
        try {
            const payload = await verifyAccessToken(token);
            currentUserId = String(payload.userId ?? "");
        } catch {
            currentUserId = undefined;
        }
    }

    const where: { isPrivate?: boolean; userId?: string } = {};
    if (visibility === "private") {
        where.isPrivate = true;
        if (currentUserId) {
            where.userId = currentUserId;
        } else {
            return Response.json({
                posts: [],
                pagination: { page, limit, total: 0, totalPages: 0, hasMore: false },
            });
        }
    } else if (visibility === "public") {
        where.isPrivate = false;
    }

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        }),
        prisma.post.count({ where }),
    ]);

    return Response.json({
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    });
}
