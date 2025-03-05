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

export async function GET(req: NextRequest) {
  try {
    // Verify token and extract userId from the payload
    const decoded = verifyToken(req);
    const userIdFromToken = (decoded as { userId?: string }).userId;
    if (!userIdFromToken) {
      throw new Error('User id not found in token');
    }

    // Fetch the user profile using the userId from the token
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userIdFromToken },
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Query the PostAction table for actions of type LIKED for this user
    const likedActions = await prisma.postAction.findMany({
      where: {
        userProfileId: userProfile.id,
        actionType: 'LIKED',
      },
      select: {
        postId: true,
      },
    });

    // Extract the liked post IDs from the query result
    const likedPostIds = likedActions.map((action) => action.postId);

    return NextResponse.json({ likedPostIds });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
