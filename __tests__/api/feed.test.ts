import { GET } from '@/app/api/feed/route'; // Adjust path as needed
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { setupTestUsersAndProfiles } from '@/__tests__/helpers/setupTestUsers.helper';
import { setupTestPosts } from '@/__tests__/helpers/setupTestPosts.helper';
import { clearDatabase } from '@/__tests__/helpers/db.helper';

const prisma = new PrismaClient();
const host = process.env.HOST || 'http://localhost:3000';

// Helper to create a NextRequest for the feed API
const createFeedRequest = (queryParams: string, token?: string) => {
  const url = `${host}/api/feed?${queryParams}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return new NextRequest(url, { method: 'GET', headers });
};

describe('Feed API Tests', () => {
  beforeAll(async () => {
    // Set up test users, their profiles, and any posts required for testing
    await setupTestUsersAndProfiles();
    await setupTestPosts();
  });

  afterAll(async () => {
    // Clear the test database and disconnect Prisma
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('returns 401 if the Authorization header is missing', async () => {
    const req = createFeedRequest('type=home&page=1&limit=20');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Authorization header missing');
  });

  it('returns 401 if the token is invalid', async () => {
    const req = createFeedRequest('type=home&page=1&limit=20', 'invalidtoken');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid or expired token');
  });

  it('returns posts data for valid token with feed type "home"', async () => {
    // Using USER1's token from your .env.test
    const validToken = process.env.USER1_token;
    const req = createFeedRequest('type=home&page=1&limit=20', validToken);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('posts');
    expect(json).toHaveProperty('page', 1);
    expect(json).toHaveProperty('limit', 20);
    expect(Array.isArray(json.posts)).toBe(true);
  });

  // Optionally, you can add tests for other feed types, for example:
  it('returns posts data for valid token with feed type "following"', async () => {
    const validToken = process.env.USER1_token;
    const req = createFeedRequest('type=following&page=1&limit=20', validToken);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('posts');
    expect(Array.isArray(json.posts)).toBe(true);
  });
});
