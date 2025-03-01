import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode token to extract user info (assumes token payload contains userId)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Retrieve user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse request body (now including media and poll if provided)
    const { content, media, poll } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid post content' },
        { status: 400 }
      );
    }

    // Create the post record
    const newPost = await prisma.post.create({
      data: {
        brief: content,
        extendedDescription: content,
        author: { connect: { id: userProfile.id } },
      },
      include: {
        author: { include: { user: true } },
        comments: true,
        media: true,
      },
    });

    // If media data is provided, create media records and associate with the post.
    if (media && Array.isArray(media)) {
      for (const mediaItem of media) {
        if (mediaItem.url && mediaItem.type) {
          await prisma.media.create({
            data: {
              url: mediaItem.url,
              type: mediaItem.type,
              altText: mediaItem.altText,
              order: mediaItem.order,
              post: { connect: { id: newPost.id } },
            },
          });
        }
      }
    }

    // If poll data is provided, create a poll record.
    if (poll && poll.question && Array.isArray(poll.options)) {
      await prisma.poll.create({
        data: {
          postId: newPost.id,
          question: poll.question,
          options: poll.options,
        },
      });
    }

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
