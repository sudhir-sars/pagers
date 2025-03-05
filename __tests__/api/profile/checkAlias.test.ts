import { GET } from '@/app/api/profile/check-alias/route'; // adjust the import if needed
import { NextRequest } from 'next/server';
import { setupTestUsersAndProfiles } from '@/__tests__/helpers/setupTestUsers.helper';

import { clearDatabase } from '../../helpers/db.helper';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const host = process.env.HOST || 'http://localhost:3000';

const createRequest = (alias: string) => {
  const url = `${host}/api/profile/check-alias?alias=${encodeURIComponent(
    alias
  )}`;
  return new NextRequest(url, { method: 'GET' });
};

describe('Alias Check API', () => {
  beforeAll(async () => {
    // Set up test users and their profiles sequentially
    await setupTestUsersAndProfiles();
  });

  afterAll(async () => {
    // Clear the test database and disconnect Prisma
    // await clearDatabase();
    await prisma.$disconnect();
  });

  it('returns available when alias is free', async () => {
    const req = createRequest('uniquealias123');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isAvailable).toBe(true);
  });

  it('returns not available when alias is taken', async () => {
    // This test assumes that 'takenalias' is already used in your test database.
    const req = createRequest('testalias2');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isAvailable).toBe(false);
  });
});
