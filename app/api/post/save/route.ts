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

    const newAction = await prisma.postAction.create({
      data: {
        userProfile: { connect: { id: userProfile.id } },
        post: { connect: { id: postId } },
        actionType: 'SAVED',
      },
    });

    return NextResponse.json({ success: true, postAction: newAction });
  } catch (error: any) {
    console.error('Error saving post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
