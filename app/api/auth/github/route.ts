import { NextResponse } from 'next/server';

export async function GET() {
  const GITHUB_SCOPES = 'repo delete_repo read:org read:commit_status user';

  const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=${GITHUB_SCOPES}`;

  return NextResponse.redirect(GITHUB_AUTH_URL);
}
