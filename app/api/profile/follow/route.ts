import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

// Follow a user
export async function POST(req: NextRequest) {
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

  // Parse request body to get the recipient's ID (the user to follow)
  const { recipientId } = await req.json();
  if (!recipientId) {
    return NextResponse.json(
      { error: 'Recipient ID missing' },
      { status: 400 }
    );
  }
  console.log(recipientId, userProfile.id);

  // Optionally check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: userProfile.id,
        followedId: recipientId,
      },
    },
  });
  if (existingFollow) {
    return NextResponse.json(
      { message: 'Already following this user' },
      { status: 200 }
    );
  }

  try {
    // Create follow record
    await prisma.follow.create({
      data: {
        followerId: userProfile.id,
        followedId: recipientId,
      },
    });
    // Optionally, you could add a notification here
    return NextResponse.json(
      { message: 'Followed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}
