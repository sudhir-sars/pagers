/*
  Warnings:

  - You are about to drop the column `userProfileId` on the `ConversationParticipant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[conversationId,userId]` on the table `ConversationParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ConversationParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_userProfileId_fkey";

-- DropIndex
DROP INDEX "ConversationParticipant_conversationId_userProfileId_key";

-- AlterTable
ALTER TABLE "ConversationParticipant" DROP COLUMN "userProfileId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
