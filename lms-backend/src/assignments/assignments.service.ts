import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: { id: number; role: string }) {
    if (user.role === 'LECTURER') {
      return this.prisma.assignment.findMany({
        where: {
          course: {
            lecturerId: user.id,
          },
        },
        include: {
          course: {
            select: { id: true, title: true },
          },
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    const assignments = await this.prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              studentId: user.id,
            },
          },
        },
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
        submissions: {
          where: { studentId: user.id },
          select: {
            id: true,
            content: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      course: assignment.course,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      isSubmitted: assignment.submissions.length > 0,
      submission: assignment.submissions[0] || null,
    }));
  }

  async findOne(assignmentId: string, user: { id: number; role: string }) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: { id: true, title: true, lecturerId: true },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (user.role === 'LECTURER' && assignment.course.lecturerId !== user.id) {
      throw new ForbiddenException('Not your assignment');
    }

    if (user.role === 'STUDENT') {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: user.id,
            courseId: assignment.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }

      const submission = await this.prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: user.id,
          },
        },
      });

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        courseId: assignment.courseId,
        course: {
          id: assignment.course.id,
          title: assignment.course.title,
        },
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        isSubmitted: Boolean(submission),
        submission,
      };
    }

    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      course: {
        id: assignment.course.id,
        title: assignment.course.title,
      },
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      totalSubmissions: submissions.length,
      submissions,
    };
  }

  async findByCourse(courseId: number) {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async create(dto: CreateAssignmentDto, lecturerId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) throw new NotFoundException('Course not found');
    if (course.lecturerId !== Number(lecturerId))
      throw new ForbiddenException('Not your course');

    return this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseId: dto.courseId,
      },
    });
  }

  async update(
    assignmentId: string,
    dto: UpdateAssignmentDto,
    lecturerId: number,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.course.lecturerId !== lecturerId)
      throw new ForbiddenException('Not your assignment');

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      },
    });
  }

  async remove(assignmentId: string, lecturerId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.course.lecturerId !== lecturerId)
      throw new ForbiddenException('Not your assignment');

    return this.prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }
  async submit(
    assignmentId: string,
    dto: { content: string },
    studentId: number,
  ) {
    return this.prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        content: dto.content,
      },
    });
  }

  async getStudentAssignments(courseId: number, studentId: number) {
    // Verify student is enrolled in the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Get all assignments for the course
    const assignments = await this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        course: {
          select: { id: true, title: true },
        },
        submissions: {
          where: { studentId },
          select: {
            id: true,
            content: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include submission status
    return assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      course: assignment.course,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      isSubmitted: assignment.submissions.length > 0,
      submission: assignment.submissions[0] || null,
    }));
  }

  async getAssignmentSubmissions(assignmentId: string, lecturerId: number) {
    // Verify lecturer owns the assignment's course
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your assignment');
    }

    // Get all submissions with student info
    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
      },
      totalSubmissions: submissions.length,
      submissions,
    };
  }
}
