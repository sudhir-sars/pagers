import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

// Verify the token and return the decoded payload.
function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// GET handler to fetch only the following list (array of followed user IDs)
export async function GET(req: NextRequest) {
  try {
    // Verify token and extract userId from the payload
    const decoded = verifyToken(req);
    const userId = (decoded as { userId?: string }).userId;
    if (!userId) {
      throw new Error('User id not found in token');
    }

    // Fetch the user's profile with only the following field
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { following: true },
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Extract an array of followed user IDs from the following records
    const followingIds = userProfile.following.map(
      (follow) => follow.followedId
    );

    return NextResponse.json({ following: followingIds });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
