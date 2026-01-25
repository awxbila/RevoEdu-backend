-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'GRADED', 'REJECTED');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "gradedAt" TIMESTAMP(3),
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED';
