import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function GET(req: NextRequest) {
  // Check for Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    );
  }
  const token = authHeader.split(' ')[1];

  try {
    // Verify token and extract userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Fetch the user's UserProfile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    const currentUserProfileId = userProfile.id;

    // Get followed user IDs and project IDs
    const followedUserIds = await prisma.follow
      .findMany({
        where: { followerId: currentUserProfileId },
        select: { followedId: true },
      })
      .then((follows) => follows.map((f) => f.followedId));

    const followedProjectIds = await prisma.projectFollow
      .findMany({
        where: { followerId: currentUserProfileId },
        select: { projectId: true },
      })
      .then((follows) => follows.map((f) => f.projectId));

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'home';
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 20;
    const skip = (page - 1) * limit;

    // Define the where clause based on feed type
    let whereClause;
    switch (type) {
      case 'home':
        whereClause = {};
        break;
      case 'following':
        whereClause = { authorId: { in: followedUserIds } };
        break;
      case 'projects':
        whereClause = { projectId: { not: null } };
        break;
      case 'editors-choice':
        whereClause = { isEditorsChoice: true };
        break;
      default:
        whereClause = {}; // Fallback to all posts
    }

    // Fetch posts with pagination and relations
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: { include: { user: true } },
        comments: {
          include: {
            author: true,
            _count: { select: { replies: true } }, // Count of replies per comment
          },
        },
        media: true,
        poll: true,
        _count: { select: { comments: true } }, // Count of comments per post
      },
    });

    // Return posts with pagination info
    return NextResponse.json({ posts, page, limit });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
