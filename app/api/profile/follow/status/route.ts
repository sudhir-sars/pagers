import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

// GET handler to check if the user is following another user
export async function GET(req: NextRequest) {
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

  // Get recipientId from query parameters
  const recipientId = req.nextUrl.searchParams.get('recipientId');
  if (!recipientId) {
    return NextResponse.json(
      { error: 'Recipient ID missing' },
      { status: 400 }
    );
  }

  // Check if a follow relationship exists
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: userProfile.id,
        followedId: recipientId,
      },
    },
  });

  return NextResponse.json(
    { isFollowing: Boolean(existingFollow) },
    { status: 200 }
  );
}
