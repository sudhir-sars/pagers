import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Validate the Authorization header.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Retrieve the user's profile.
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse and validate the request body.
    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    // Find the existing like action by this user on the post.
    const existingAction = await prisma.postAction.findFirst({
      where: {
        userProfileId: userProfile.id,
        postId: postId,
        actionType: 'LIKED',
      },
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: 'Post not liked by user' },
        { status: 400 }
      );
    }

    // Decrement the post's like count.
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likes: { decrement: 1 } },
    });

    // Remove the like action record.
    await prisma.postAction.delete({
      where: { id: existingAction.id },
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post unliked successfully',
    });
  } catch (error: any) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
