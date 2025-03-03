import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

/**
 * Helper function that verifies the JWT from the request and returns the associated user profile.
 * Throws an error if verification fails.
 */
async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    return userProfile;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

/**
 * GET handler: Retrieves notifications for the authenticated user.
 * The notifications are ordered by creation date (most recent first).
 */
export async function GET(req: NextRequest) {
  try {
    const userProfile = await verifyAuth(req);
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userProfile.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

/**
 * POST handler: Creates a new notification.
 * Requires that the request contains recipientId, type, and message.
 * The sender is set to the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const userProfile = await verifyAuth(req);
    const body = await req.json();
    const {
      type,
      message,
      recipientId,
      postId,
      commentId,
      replyId,
      projectId,
    } = body;

    if (!recipientId || !message || !type) {
      return NextResponse.json(
        { error: 'recipientId, message, and type are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        recipient: { connect: { id: recipientId } },
        // For system notifications, sender may be null. Otherwise, we connect the authenticated user.
        ...(userProfile && { sender: { connect: { id: userProfile.id } } }),
        type,
        message,
        postId,
        commentId,
        replyId,
        projectId,
      },
    });
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
