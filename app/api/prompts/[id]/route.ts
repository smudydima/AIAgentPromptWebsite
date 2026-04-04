import { prisma } from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { title, tags, description } = await req.json();

    const post = await prisma.post.update({
        where: { id },
        data: { title, tags, description },
    });

    return Response.json(post);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    await prisma.post.delete({
        where: { id },
    });

    return Response.json({ success: true });
}
