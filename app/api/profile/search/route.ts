// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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

export async function GET(req: NextRequest) {
  try {
    // Simply verify the token. No DB call for the user profile.
    verifyToken(req);

    // Retrieve the query string from the URL.
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    if (!query || query.trim() === '') {
      return NextResponse.json({ users: [] });
    }

    // Search for users by name or email in the User model
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        userId: true,
        email: true,
        image: true,
        profile: {
          select: {
            alias: {
              select: {
                name: true, // Select the alias name
              },
            },
          },
        },
      },
    });

    // Format the response to include alias in the users list.
    // const formattedUsers = users.map((user) => ({
    //   id: user.id,
    //   name: user.name,
    //   email: user.email,
    //   image: user.image,
    //   alias: user.profile?.alias?.name,
    // }));

    return NextResponse.json({ users: users });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
