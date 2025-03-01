-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('ONE_ON_ONE', 'GROUP');

-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'FILE';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'ONE_ON_ONE';
