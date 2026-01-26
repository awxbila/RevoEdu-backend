-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "brief" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "semester" TEXT,
ADD COLUMN     "status" TEXT;
