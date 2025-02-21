import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_HOST!;
const prisma = new PrismaClient();

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

/**
 * Save or update a user in the database based on Google user info.
 */
async function saveUser(userInfo: any, tokens: any) {
  // Extract properties from the Google user info.
  const googleId = userInfo.id;
  const email = userInfo.email;
  const name = userInfo.name;
  const image = userInfo.picture;

  // Check if a user with the given googleId exists.
  const existingUser = await prisma.user.findUnique({
    where: { googleId },
  });

  if (existingUser) {
    // Optionally update user details.
    return await prisma.user.update({
      where: { id: existingUser.id },
      data: { email, name, image },
    });
  } else {
    // Create a new user.
    return await prisma.user.create({
      data: { googleId, email, name, image },
    });
  }
}

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const tokenGenCode = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Expect state to be a JSON string containing a sessionId.
  let sessionId: string | undefined;
  try {
    ({ sessionId } = JSON.parse(state || '{}'));
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 400,
      statusText: 'Invalid state parameter',
    });
  }

  if (!tokenGenCode || !sessionId) {
    return NextResponse.json({
      success: false,
      status: 400,
      statusText: 'Invalid request',
    });
  }

  try {
    // Exchange the authorization code for tokens.
    const { tokens } = await oAuth2Client.getToken(tokenGenCode);
    oAuth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      console.error(
        'Refresh token not returned. User may need to reauthenticate.'
      );
    }

    // Retrieve user info from Google.
    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
    const userInfoResponse = await oauth2.userinfo.get();
    const userInfo = userInfoResponse.data;
    console.log(userInfo);

    // Save or update the user in the database.
    await saveUser(userInfo, tokens);

    // Create a JWT payload with the refresh token (if available) and user ID.
    const payload = {
      refreshToken: tokens.refresh_token,
      userId: userInfo.id,
    };

    const signedToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const redirectUrl = `${BASE_URL}?JWT_token=${signedToken}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      success: false,
      status: 500,
      error: 'Failed to process request',
    });
  }
};

// If you have a connectDb function, you can wrap your handler with it.
// For now, we'll simply export the handler directly.
export const GET = handler;
