import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const publisher = createClient({ url: process.env.REDIS_URL });
const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function POST(req: NextRequest) {
  // Verify authorization header and extract JWT token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    );
  }
  const token = authHeader.split(' ')[1];

  try {
    // Verify token and extract user info
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

    // Parse the request body
    const {
      name,
      brief,
      description,
      techStack,
      github,
      liveLink,
      tags,
      media, // media array for the project
    } = await req.json();

    // Validate required fields
    if (
      !name ||
      typeof name !== 'string' ||
      !brief ||
      typeof brief !== 'string' ||
      !description ||
      typeof description !== 'string' ||
      !github ||
      typeof github !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid project data' },
        { status: 400 }
      );
    }

    // Create the project record.
    // The authenticated user is set as both the project lead and the owner.
    const newProject = await prisma.projectProfile.create({
      data: {
        name,
        brief,
        description,
        github,
        liveLink: liveLink || null,
        techStack: Array.isArray(techStack) ? techStack : [],
        tags: Array.isArray(tags) ? tags : [],
        status: 'active', // adjust as needed
        startDate: new Date(),
        projectLead: { connect: { id: userProfile.id } },
        owner: { connect: { id: userProfile.id } },
      },
    });

    // If media data is provided, create media records and associate them with the project.
    if (media && Array.isArray(media)) {
      for (const mediaItem of media) {
        if (mediaItem.url && mediaItem.type) {
          await prisma.media.create({
            data: {
              url: mediaItem.url,
              type: mediaItem.type,
              altText: mediaItem.altText,
              order: mediaItem.order,
              project: { connect: { id: newProject.id } },
            },
          });
        }
      }
    }

    // Create a post that links to the project.
    // Here we use the project's brief and description for the post content.
    const newPost = await prisma.post.create({
      data: {
        brief,
        extendedDescription: description,
        author: { connect: { id: userProfile.id } },
        project: { connect: { id: newProject.id } }, // Connect via relation
      },
      include: {
        author: { include: { user: true } },
        media: true,
        comments: true,
      },
    });

    // Optionally, publish a message to Redis for real-time updates
    await publisher.connect();
    await publisher.publish(
      'newProject',
      JSON.stringify({ newProject, newPost, authorId: userProfile.id })
    );
    await publisher.disconnect();

    // Return both the project and the linked post in the response
    return NextResponse.json(
      { project: newProject, post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
