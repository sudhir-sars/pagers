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
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Invalid token');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    let userId: string | null = null;

    if (idParam) {
      userId = idParam; // Use the provided ID directly if present
    } else {
      const decoded = verifyToken(req);
      userId =
        (decoded as { userId?: string; id?: string }).userId ||
        decoded.id ||
        null;
    }

    if (!userId) {
      throw new Error('User ID not found');
    }

    // Fetch the user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: idParam ? { id: idParam } : { userId },
      include: {
        following: true,
        followers: true,
        posts: {
          include: {
            author: true,
            comments: { include: { author: true } },
            media: true,
            poll: true,
            actions: true,
          },
        },
        education: true,
        experiences: true,
        projects: { include: { media: true, contributors: true } },
        contributedProjects: { include: { media: true, projectLead: true } },
        ledProjects: { include: { media: true, contributors: true } },
        comments: { include: { post: true } },
        replies: true,
        conversationParticipants: true,
        sentMessages: true,
        postActions: true,
      },
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    return NextResponse.json({ profile: userProfile });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
