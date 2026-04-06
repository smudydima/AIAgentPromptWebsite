import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { title, tags, description, isPrivate } = await req.json();

    const post = await prisma.post.create({
        data: { title, tags, description, isPrivate },
    });

    return Response.json(post);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const visibility = searchParams.get("visibility");

    const where: { isPrivate?: boolean } = {};
    if (visibility === "private") {
        where.isPrivate = true;
    } else if (visibility === "public") {
        where.isPrivate = false;
    }

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
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
