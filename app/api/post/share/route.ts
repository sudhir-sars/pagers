import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient, ConversationType } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Check authorization and get sender's profile
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const senderProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!senderProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const { postId, recipientId } = await req.json();
    if (!postId || !recipientId) {
      return NextResponse.json(
        { error: 'postId and recipientId are required' },
        { status: 400 }
      );
    }

    // Check for an existing one-on-one conversation between sender and recipient.
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: ConversationType.ONE_ON_ONE,
        participants: {
          every: { userProfileId: { in: [senderProfile.id, recipientId] } },
        },
      },
    });

    // Create a conversation if none exists.
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: ConversationType.ONE_ON_ONE,
          participants: {
            create: [
              { userProfile: { connect: { id: senderProfile.id } } },
              { userProfile: { connect: { id: recipientId } } },
            ],
          },
        },
      });
    }

    // Create a share message in the conversation.
    const newMessage = await prisma.message.create({
      data: {
        conversation: { connect: { id: conversation.id } },
        sender: { connect: { id: senderProfile.id } },
        type: 'POST_SHARE',
        post: { connect: { id: postId } },
        content: null,
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
