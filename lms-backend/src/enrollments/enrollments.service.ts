import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ===============================
   * STUDENT
   * ===============================
   */

  async enrollCourse(studentId: number, courseId: number) {
    // 1️⃣ check course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 2️⃣ prevent duplicate enrollment
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled');
    }

    // 3️⃣ create enrollment
    return this.prisma.enrollment.create({
      data: {
        studentId,
        courseId,
      },
    });
  }

  async getStudentEnrollments(studentId: number) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async unenrollCourse(studentId: number, courseId: number) {
    // 1️⃣ Check enrollment exists
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // 2️⃣ Delete enrollment
    await this.prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    return {
      message: 'Successfully unenrolled from course',
      courseId,
    };
  }

  async updateEnrollment(
    enrollmentId: number,
    studentId: number,
    payload: { semester?: string; status?: string },
  ) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.studentId !== studentId) {
      throw new ForbiddenException(
        'You are not allowed to edit this enrollment',
      );
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        ...(payload.semester !== undefined
          ? { semester: payload.semester }
          : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
      },
    });
  }

  /**
   * ===============================
   * LECTURER
   * ===============================
   */

  async getStudentsByCourse(courseId: number, lecturerId: number) {
    // 1️⃣ check course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You are not allowed to view this course');
    }

    // 2️⃣ get students
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
