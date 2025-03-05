import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestPosts() {
  // Retrieve test user IDs from environment variables
  const user1UserId = process.env.USER1_userId;
  const user2UserId = process.env.USER2_userId;

  if (!user1UserId || !user2UserId) {
    throw new Error(
      'Test user IDs are not defined in the environment variables.'
    );
  }

  // Retrieve user profiles for test users
  const userProfile1 = await prisma.userProfile.findUnique({
    where: { userId: user1UserId },
  });
  const userProfile2 = await prisma.userProfile.findUnique({
    where: { userId: user2UserId },
  });

  if (!userProfile1 || !userProfile2) {
    throw new Error(
      'Test user profiles not found. Ensure setupTestUsersAndProfiles has been run.'
    );
  }

  // Create a test post for USER1
  const post1 = await prisma.post.create({
    data: {
      brief: 'Test post content for USER1',
      extendedDescription: 'Test post content for USER1 extended description',
      author: { connect: { id: userProfile1.id } },
    },
    include: {
      author: true,
    },
  });

  // Create a test post for USER2
  const post2 = await prisma.post.create({
    data: {
      brief: 'Test post content for USER2',
      extendedDescription: 'Test post content for USER2 extended description',
      author: { connect: { id: userProfile2.id } },
    },
    include: {
      author: true,
    },
  });

  // Optionally return the created posts for further testing
  return { post1, post2 };
}

describe('dummy test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
