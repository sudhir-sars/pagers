import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
// import { setTempSession } from '../../../utils/session';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const SCOPES = [
  // 'https://mail.google.com/',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  // 'https://www.googleapis.com/auth/pubsub',
  // 'https://www.googleapis.com/auth/drive',
];

console.log('REDIRECT_URI: ' + REDIRECT_URI);

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const sessionId = 'bvjhv';

  if (sessionId) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force the user to re-consent to ensure a refresh token is returned
      scope: SCOPES,
      state: JSON.stringify({ sessionId }),
    });

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json({
    success: false,
    status: 400,
    statusText: 'Missing sessionId',
  });
};
