// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

async function getUserProfileIdFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserProfileIdFromRequest(req);

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
        participants: { include: { userProfile: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const senderId = await getUserProfileIdFromRequest(req);
    const body = await req.json();
    const { conversationId, recipientId, content } = body;
    console.log(senderId, conversationId, recipientId, content);

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // If conversationId is provided, create a new message in that conversation.
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      const isParticipant = conversation.participants.some(
        (p) => p.userId === senderId
      );
      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Unauthorized to send message in this conversation' },
          { status: 403 }
        );
      }

      const newMessage = await prisma.message.create({
        data: {
          conversation: { connect: { id: conversationId } },
          sender: { connect: { userId: senderId } },
          type: 'TEXT',
          content,
        },
        include: { sender: true },
      });
      return NextResponse.json({ message: newMessage });
    } else {
      // No conversationId provided: require recipientId and create a new conversation.
      if (!recipientId) {
        return NextResponse.json(
          { error: 'conversationId or recipientId is required' },
          { status: 400 }
        );
      }

      if (!recipientId) {
        return NextResponse.json(
          { error: 'Recipient not found' },
          { status: 404 }
        );
      }

      // Proceed to create a new conversation with a nested message.
      const newConversation = await prisma.conversation.create({
        data: {
          type: 'ONE_ON_ONE',
          participants: {
            create: [
              { userId: senderId }, // authenticated user's profile id (userId, not the primary key)
              { userId: recipientId },
            ],
          },
          messages: {
            create: {
              // Change here: connect using userId instead of id
              sender: { connect: { userId: senderId } },
              type: 'TEXT',
              content,
            },
          },
        },
        include: {
          participants: { include: { userProfile: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: true },
          },
        },
      });

      return NextResponse.json({ conversation: newConversation });
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 401 }
    );
  }
}
