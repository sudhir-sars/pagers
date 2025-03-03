import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Parse the alias from the query parameters
  const { searchParams } = new URL(req.url);
  const alias = searchParams.get('alias');

  // Validate the alias: must be provided and not empty or whitespace-only
  if (!alias || alias.trim() === '') {
    return NextResponse.json(
      {
        success: false,
        status: 400,
        statusText: 'Invalid alias provided',
      },
      { status: 400 }
    );
  }

  try {
    // Query the UserProfile model to check if the alias already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { alias: alias },
    });

    // If a profile with this alias exists, it's taken
    if (existingProfile) {
      return NextResponse.json({
        success: true,
        isAvailable: false,
        message: 'Alias is already taken',
      });
    } else {
      // If no profile is found, the alias is available
      return NextResponse.json({
        success: true,
        isAvailable: true,
        message: 'Alias is available',
      });
    }
  } catch (error: any) {
    // Handle any database or server errors
    console.error('Error checking alias uniqueness:', error);
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
}
