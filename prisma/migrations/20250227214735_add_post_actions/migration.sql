-- CreateEnum
CREATE TYPE "PostActionType" AS ENUM ('LIKED', 'SAVED', 'COMMENTED', 'SHARED', 'REPOSTED');

-- CreateTable
CREATE TABLE "PostAction" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "actionType" "PostActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostAction" ADD CONSTRAINT "PostAction_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAction" ADD CONSTRAINT "PostAction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
