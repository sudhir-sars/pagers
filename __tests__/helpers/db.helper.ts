import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function clearDatabase() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "UserProfile" RESTART IDENTITY CASCADE;`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`
  );
  // Add additional table truncations if needed.
}

// At the end of __tests__/helpers/db.ts
describe('dummy test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
