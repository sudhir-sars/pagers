import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Retrieve the current user's profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: decoded.userId },
  });
  if (!userProfile) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404 }
    );
  }

  // Retrieve recipientId from query parameters
  const { searchParams } = new URL(req.url);
  const recipientId = searchParams.get('recipientId');
  if (!recipientId) {
    return NextResponse.json(
      { error: 'Recipient ID missing' },
      { status: 400 }
    );
  }

  try {
    // Delete the follow record using the composite primary key
    await prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId: userProfile.id,
          followedId: recipientId,
        },
      },
    });
    return NextResponse.json(
      { message: 'Unfollowed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
