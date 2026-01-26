/*
  Warnings:

  - You are about to drop the column `content` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_assignmentId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "content",
ADD COLUMN     "fileUrl" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
