// __tests__/helpers/seuptestusers.ts

import { saveUser } from '@/app/api/auth/callback/route';
import { POST } from '@/app/api/profile/create/route';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Helper function to create a NextRequest for the profile creation endpoint.
 */
const createRequest = (token: string | null, body: any) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return new NextRequest('http://localhost:3000/api/profile/create', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

/**
 * Sets up test users by calling the real saveUser function.
 * Returns an object with user1 and user2 as stored in the test database.
 */
export async function setupTestUsers() {
  const dummyTokens = { refresh_token: 'dummy-refresh-token' };

  const dummyUserInfo1 = {
    id: process.env.USER1_userId || '115465555759798898338',
    email: process.env.USER1_email || 'sudhir.sars@gmail.com',
    name: process.env.USER1_name || 'sudhir saraswat',
    picture:
      process.env.USER1_image ||
      'https://lh3.googleusercontent.com/a/ACg8ocJQKkg8d42a6tThTFVOjXuB20kHLIlaGrbr_lZigAbmaK4jGXUA2A=s96-c',
  };

  const dummyUserInfo2 = {
    id: process.env.USER2_userId || '110141938326000667592',
    email: process.env.USER2_email || 'voyagerintodeathpool@gmail.com',
    name: process.env.USER2_name || 'Death Pool',
    picture:
      process.env.USER2_image ||
      'https://lh3.googleusercontent.com/a/ACg8ocK3P7p3O-rRSi_RtdabGmlmV8q_NWWGhTpHg-8HdS6AGVw2DA=s96-c',
  };

  // Save or update User 1.
  const result1 = await saveUser(dummyUserInfo1, dummyTokens);
  // Save or update User 2.
  const result2 = await saveUser(dummyUserInfo2, dummyTokens);

  return {
    user1: result1.user,
    user2: result2.user,
  };
}

/**
 * Creates profiles for both test users by invoking the profile creation endpoint.
 */
export async function setupTestProfiles() {
  const validUserId1 = process.env.USER1_userId || '115465555759798898338';
  const validUserId2 = process.env.USER2_userId || '110141938326000667592';

  // Generate valid tokens for each user using jwt.sign.
  const validToken1 = jwt.sign(
    { userId: validUserId1 },
    process.env.NEXT_PUBLIC_JWT_SECRET!,
    { expiresIn: '1y' }
  );
  const validToken2 = jwt.sign(
    { userId: validUserId2 },
    process.env.NEXT_PUBLIC_JWT_SECRET!,
    { expiresIn: '1y' }
  );

  // Prepare profile data for User 1.
  const validProfileData1 = {
    userId: validUserId1,
    image: 'http://example.com/image.jpg',
    name: 'Test User 1',
    title: 'Software Engineer',
    university: 'Test University',
    bio: 'A test user',
    location: 'Test City',
    github: 'testgithub1',
    codeforces: 'testcodeforces1',
    skills: ['JavaScript', 'TypeScript'],
    email: 'test1@example.com',
    alias: 'testalias1',
  };

  // Prepare profile data for User 2.
  const validProfileData2 = {
    userId: validUserId2,
    image: 'http://example.com/image2.jpg',
    name: 'Test User 2',
    title: 'Data Scientist',
    university: 'Another University',
    bio: 'Another test user',
    location: 'Another City',
    github: 'testgithub2',
    codeforces: 'testcodeforces2',
    skills: ['Python', 'R'],
    email: 'test2@example.com',
    alias: 'testalias2',
  };

  // Create User 1 profile.
  const req1 = createRequest(validToken1, validProfileData1);
  const res1 = await POST(req1);
  // Adjust condition to accept 200 as success if that's what's returned.
  if (res1.status !== 200) {
    throw new Error(
      `Failed to create profile for User 1, status: ${res1.status}`
    );
  }

  // Create User 2 profile.
  const req2 = createRequest(validToken2, validProfileData2);
  const res2 = await POST(req2);
  if (res2.status !== 200) {
    throw new Error(
      `Failed to create profile for User 2, status: ${res2.status}`
    );
  }

  return true;
}

/**
 * Convenience function that sets up both test users and their profiles sequentially.
 */
export async function setupTestUsersAndProfiles() {
  // First, set up users.
  await setupTestUsers();
  // Then, set up profiles.
  await setupTestProfiles();
}

// At the end of __tests__/helpers/db.ts
describe('dummy test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
