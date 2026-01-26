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
            fileUrl: true,
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
      code: assignment.code,
      brief: assignment.brief,
      dueDate: assignment.dueDate,
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
        code: assignment.code,
        brief: assignment.brief,
        dueDate: assignment.dueDate,
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
      code: assignment.code,
      brief: assignment.brief,
      dueDate: assignment.dueDate,
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
        code: dto.code,
        brief: dto.brief,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
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
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.brief !== undefined ? { brief: dto.brief } : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
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
    file: Express.Multer.File,
    studentId: number,
  ) {
    // Verify assignment exists
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: { id: true },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Verify student is enrolled in the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (existingSubmission) {
      throw new ForbiddenException(
        'You have already submitted this assignment',
      );
    }

    // Generate file URL
    const fileUrl = `/uploads/submissions/${file.filename}`;

    return this.prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl,
      },
      include: {
        assignment: {
          select: { id: true, title: true },
        },
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
            fileUrl: true,
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

  async gradeSubmission(
    submissionId: string,
    dto: { grade: number; feedback?: string },
    lecturerId: number,
  ) {
    // Get submission with assignment info
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Verify lecturer owns the course
    if (submission.assignment.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your assignment');
    }

    // Update submission with grade
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: dto.grade,
        feedback: dto.feedback,
        status: 'GRADED',
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getSubmissionDetail(
    submissionId: string,
    userId: number,
    userRole: string,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          include: { course: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Student can only view their own submission
    if (userRole === 'STUDENT' && submission.studentId !== userId) {
      throw new ForbiddenException('Not your submission');
    }

    // Lecturer can only view submissions for their assignments
    if (
      userRole === 'LECTURER' &&
      submission.assignment.course.lecturerId !== userId
    ) {
      throw new ForbiddenException('Not your assignment');
    }

    return submission;
  }

  async rejectSubmission(
    submissionId: string,
    dto: { feedback: string },
    lecturerId: number,
  ) {
    // Get submission with assignment info
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Verify lecturer owns the course
    if (submission.assignment.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your assignment');
    }

    // Update submission status to rejected
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        feedback: dto.feedback,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
