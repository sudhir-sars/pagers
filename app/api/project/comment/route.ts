import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Retrieve user's profile so we use its id as comment author.
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const { postId, text } = await req.json();
    if (!postId || !text) {
      return NextResponse.json(
        { error: 'postId and text are required' },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        likes: 0,
        authorId: userProfile.id, // using the user profile id
        postId,
      },
      include: { author: true },
    });

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
