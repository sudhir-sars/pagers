import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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

    // Retrieve the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    // Update the post's like count (remove non-existent relation include)
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });

    const newAction = await prisma.postAction.create({
      data: {
        userProfile: { connect: { id: userProfile.id } },
        post: { connect: { id: postId } },
        actionType: 'LIKED',
      },
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      postAction: newAction,
    });
  } catch (error: any) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
