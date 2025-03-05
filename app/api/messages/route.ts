// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const publisher = createClient({ url: process.env.REDIS_URL });

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
          include: { sender: true, post: true },
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
    // Get sender's User.id from the JWT token
    const senderId = await getUserProfileIdFromRequest(req);
    const body = await req.json();
    const { conversationId, recipientId, content } = body;
    let targetRecipientId: string | null = null; // Recipient's User.id

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    let newMessage;
    let newConversationId: string | undefined;
    let resNewConversation;

    if (conversationId) {
      // Handle existing conversation
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
      const participants = conversation.participants;
      if (participants.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid conversation: not a one-on-one conversation' },
          { status: 400 }
        );
      }
      targetRecipientId =
        participants.find((p) => p.userId !== senderId)?.userId || null;

      newMessage = await prisma.message.create({
        data: {
          conversation: { connect: { id: conversationId } },
          sender: { connect: { userId: senderId } },
          type: 'TEXT',
          content,
        },
        include: { sender: true },
      });
      newConversationId = conversationId;
    } else {
      // Handle new conversation
      if (!recipientId) {
        return NextResponse.json(
          { error: 'conversationId or recipientId is required' },
          { status: 400 }
        );
      }

      const newConversation = await prisma.conversation.create({
        data: {
          type: 'ONE_ON_ONE',
          participants: {
            create: [{ userId: senderId }, { userId: recipientId }],
          },
          messages: {
            create: {
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

      newMessage = newConversation.messages[0];
      targetRecipientId = recipientId;
      newConversationId = newConversation.id;
      resNewConversation = newConversation;
    }

    // Publish the message to Redis for real-time updates
    await publisher.connect();
    await publisher.publish(
      'newMessage',
      JSON.stringify({
        recipientId: targetRecipientId,
        message: newMessage,
        conversationId: newConversationId,
      })
    );
    await publisher.disconnect();

    // Fetch sender's UserProfile for the name
    const senderProfile = await prisma.userProfile.findUnique({
      where: { userId: senderId },
    });
    if (!senderProfile) {
      throw new Error('Sender profile not found');
    }
    const senderName = senderProfile.name || 'Someone';

    // Fetch recipient's UserProfile ID using targetRecipientId (User.id)
    console.log(targetRecipientId);
    const recipientUser = await prisma.user.findUnique({
      where: { userId: targetRecipientId! },
      include: { profile: true },
    });
    if (!recipientUser || !recipientUser.profile) {
      throw new Error('Recipient profile not found');
    }

    // Ping the internal notification API
    const authHeader = req.headers.get('Authorization');
    const notificationResponse = await fetch(
      `${process.env.HOST}/api/notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader!, // Pass the same JWT token
        },
        body: JSON.stringify({
          recipientId: recipientUser.profile.id, // UserProfile.id of recipient
          recipientUserId: recipientUser.profile.userId, // UserProfile.id of recipient
          type: 'NEW_MESSAGE',
          message: `You have a new message from ${senderName}`,
        }),
      }
    );

    if (!notificationResponse.ok) {
      console.error(
        'Failed to create notification:',
        await notificationResponse.text()
      );
      // Continue even if notification fails, as the message was sent
    }

    // Return the response
    return NextResponse.json(
      conversationId
        ? { message: newMessage }
        : { conversation: resNewConversation }
    );
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 401 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    console.log('here');
    const userId = await getUserProfileIdFromRequest(req);
    const body = await req.json();
    console.log(body);
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Check if the conversation exists and the user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 406 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this conversation' },
        { status: 403 }
      );
    }

    // Delete all related conversation participants first
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId },
    });

    // Optionally, delete messages related to the conversation
    await prisma.message.deleteMany({
      where: { conversationId },
    });

    // Delete the conversation
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
