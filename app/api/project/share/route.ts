import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient, ConversationType } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

// GET: Return users for sharing the post (from conversations, following, and followers)
export async function GET(req: NextRequest) {
  try {
    // Check authorization header and verify token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Fetch sender's profile including following and followers
    const senderProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
      include: {
        following: {
          include: {
            followed: { select: { id: true, name: true, image: true } },
          },
        },
        followers: {
          include: {
            follower: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    if (!senderProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Fetch one-on-one conversations where the user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        type: ConversationType.ONE_ON_ONE,
        participants: {
          some: { userId: senderProfile.userId },
        },
      },
      include: {
        participants: {
          include: {
            userProfile: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    // Extract the other participant from each conversation
    let conversationUsers: { id: string; name: string; image: string }[] = [];
    for (const conv of conversations) {
      for (const participant of conv.participants) {
        if (participant.userId !== senderProfile.userId) {
          conversationUsers.push(participant.userProfile);
        }
      }
    }

    // Get following users from sender's profile (users the sender is following)
    const followingUsers = senderProfile.following.map((f) => f.followed);
    // Get follower users from sender's profile (users who follow the sender)
    const followerUsers = senderProfile.followers.map((f) => f.follower);

    // Combine all sources into a single array
    const allUsers = [
      ...conversationUsers,
      ...followingUsers,
      ...followerUsers,
    ];
    // Deduplicate by user id
    const dedupedUsers = Array.from(
      new Map(allUsers.map((user) => [user.id, user])).values()
    );

    return NextResponse.json({ users: dedupedUsers });
  } catch (error: any) {
    console.error('Error fetching share users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Share a post with a recipient (create/find a one-on-one conversation and send a share message)
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
          every: { id: { in: [senderProfile.id, recipientId] } },
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
