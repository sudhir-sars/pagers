import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

// Helper function to remove duplicates based on a key.
function deduplicate<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) {
      return false;
    } else {
      seen.add(k);
      return true;
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication token
    verifyToken(req);

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // If no query is provided, return empty results
    if (query.trim() === '') {
      return NextResponse.json({
        users: { results: [], total: 0 },
        posts: { results: [], total: 0 },
        projects: { results: [], total: 0 },
      });
    }

    // **Users Search**
    const userWhere = {
      OR: [
        { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        // { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ],
    };
    const users = await prisma.userProfile.findMany({
      where: userWhere,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        title: true,
      },
    });

    // **Posts Search**
    const postWhere = {
      OR: [
        { brief: { contains: query, mode: Prisma.QueryMode.insensitive } },
        {
          extendedDescription: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          author: {
            name: { contains: query, mode: Prisma.QueryMode.insensitive },
          },
        },
      ],
    };
    const posts = await prisma.post.findMany({
      where: postWhere,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        brief: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: true,
        likes: true,
        extendedDescription: true,
      },
    });
    // const totalPosts = await prisma.post.count({ where: postWhere });

    // **Projects Search**
    const projectWhere = {
      OR: [
        { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { brief: { contains: query, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: query, mode: Prisma.QueryMode.insensitive },
        },
      ],
    };
    const projects = await prisma.projectProfile.findMany({
      where: projectWhere,
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        name: true,
        brief: true,
        projectLead: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Deduplicate results based on the unique 'id'
    const uniqueUsers = deduplicate(users, 'id');
    const uniquePosts = deduplicate(posts, 'id');
    const uniqueProjects = deduplicate(projects, 'id');

    // Return paginated results with totals (adjusting totals if necessary)
    return NextResponse.json({
      users: { results: uniqueUsers, total: uniqueUsers.length },
      posts: { results: uniquePosts, total: uniquePosts.length },
      projects: { results: uniqueProjects, total: uniqueProjects.length },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
