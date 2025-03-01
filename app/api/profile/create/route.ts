import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_HOST!;

const handler = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return NextResponse.json(
      {
        success: false,
        status: 405,
        statusText: 'Method Not Allowed',
      },
      { status: 405 }
    );
  }

  try {
    // Extract JWT token from the Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          statusText: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    const tokenUserId = decodedToken.userId;

    if (!tokenUserId) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          statusText: 'Unauthorized - Invalid token',
        },
        { status: 401 }
      );
    }

    // Parse the request body to get the profile data for creation
    const profileData = await req.json();

    // Validate that some profile data was provided
    if (!profileData || Object.keys(profileData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          statusText: 'No profile data provided',
        },
        { status: 400 }
      );
    }

    // Destructure and remove userId from incoming data
    const { skills, alias, userId, ...otherProfileData } = profileData;

    // Handle alias if provided
    const aliasNested = alias ? { create: { name: alias } } : undefined;

    // Since skills is a simple string array, we pass it directly
    const skillsArray = Array.isArray(skills) ? skills : [];

    const newUserProfile = await prisma.userProfile.create({
      data: {
        ...otherProfileData,
        alias: aliasNested,
        skills: skillsArray, // Pass the string array directly
        user: {
          connect: {
            userId: tokenUserId, // Connect the related User record
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      status: 201,
      message: 'Profile created successfully',
      data: newUserProfile,
    });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        statusText: 'Internal Server Error',
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const POST = handler;
