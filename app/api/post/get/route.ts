import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    );
  }
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token (assumes payload contains userId)
    jwt.verify(token, JWT_SECRET);

    // Get pagination parameters from the query string
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 20;
    const skip = (page - 1) * limit;

    // Retrieve posts with pagination (ordered by createdAt descending)
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: { include: { user: true } },
        comments: true,
        media: true,
        poll: true,
      },
    });

    return NextResponse.json({ posts, page, limit });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
