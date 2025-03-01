import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Parse the alias from the query parameters
  const { searchParams } = new URL(req.url);
  const alias = searchParams.get('alias');

  if (!alias) {
    return NextResponse.json(
      {
        success: false,
        status: 400,
        statusText: 'No alias provided',
      },
      { status: 400 }
    );
  }

  try {
    // Query the Alias model to check if the alias already exists
    const existingAlias = await prisma.alias.findUnique({
      where: { name: alias },
    });

    if (existingAlias) {
      return NextResponse.json({
        success: true,
        isAvailable: false,
        message: 'Alias is already taken',
      });
    } else {
      return NextResponse.json({
        success: true,
        isAvailable: true,
        message: 'Alias is available',
      });
    }
  } catch (error: any) {
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
