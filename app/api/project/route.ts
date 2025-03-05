import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Extract the id parameter from the query string
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get('id');
  if (!idParam) {
    return NextResponse.json({ error: 'Post id is missing' }, { status: 400 });
  }
  const id = parseInt(idParam);

  // Retrieve the post by id and include related data
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { include: { user: true } },
      comments: {
        include: {
          author: true,
          replies: true,
        },
      },
      media: true,
      poll: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}
