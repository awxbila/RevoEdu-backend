/*
  Warnings:

  - You are about to drop the column `semester` on the `Enrollment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "semester";

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "dueDate" TIMESTAMP(3);
