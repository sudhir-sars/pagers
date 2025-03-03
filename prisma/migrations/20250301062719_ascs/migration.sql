/*
  Warnings:

  - You are about to drop the `Alias` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[alias]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Alias" DROP CONSTRAINT "Alias_userId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isEditorsChoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "PostAction" ADD COLUMN     "actionValue" TEXT;

-- AlterTable
ALTER TABLE "ProjectProfile" ADD COLUMN     "isEditorsChoice" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "alias" TEXT;

-- DropTable
DROP TABLE "Alias";

-- CreateTable
CREATE TABLE "ProjectFollow" (
    "followerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectFollow_pkey" PRIMARY KEY ("followerId","projectId")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followedId")
);

-- CreateIndex
CREATE INDEX "ProjectFollow_followerId_idx" ON "ProjectFollow"("followerId");

-- CreateIndex
CREATE INDEX "ProjectFollow_projectId_idx" ON "ProjectFollow"("projectId");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followedId_idx" ON "Follow"("followedId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE INDEX "Degree_userProfileId_idx" ON "Degree"("userProfileId");

-- CreateIndex
CREATE INDEX "Experience_userProfileId_idx" ON "Experience"("userProfileId");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE INDEX "Media_projectId_idx" ON "Media"("projectId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_projectId_idx" ON "Post"("projectId");

-- CreateIndex
CREATE INDEX "PostAction_userProfileId_idx" ON "PostAction"("userProfileId");

-- CreateIndex
CREATE INDEX "PostAction_postId_idx" ON "PostAction"("postId");

-- CreateIndex
CREATE INDEX "ProjectProfile_ownerId_idx" ON "ProjectProfile"("ownerId");

-- CreateIndex
CREATE INDEX "ProjectProfile_projectLeadId_idx" ON "ProjectProfile"("projectLeadId");

-- CreateIndex
CREATE INDEX "Reply_authorId_idx" ON "Reply"("authorId");

-- CreateIndex
CREATE INDEX "Reply_commentId_idx" ON "Reply"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_alias_key" ON "UserProfile"("alias");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFollow" ADD CONSTRAINT "ProjectFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFollow" ADD CONSTRAINT "ProjectFollow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
