import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ModuleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ===============================
   * GET COURSES
   * ===============================
   */

  async findAll() {
    return this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        brief: true,
        imageUrl: true,
        code: true,
        lecturerId: true,
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            code: true,
            brief: true,
            dueDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        brief: true,
        imageUrl: true,
        code: true,
        lecturerId: true,
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            code: true,
            brief: true,
            dueDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  /**
   * ===============================
   * LECTURER-ONLY LOGIC
   * ===============================
   */

  async create(
    dto: CreateCourseDto,
    lecturerId: number,
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | null = null;

    if (file) {
      // Generate URL for uploaded image
      imageUrl = `/uploads/courses/${file.filename}`;
    }

    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        brief: dto.brief,
        imageUrl,
        code: dto.code,
        lecturerId,
      },
    });
  }

  async update(courseId: number, dto: UpdateCourseDto, lecturerId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 🔒 Ownership check
    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You are not allowed to update this course');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        description: dto.description,
        brief: dto.brief,
        code: dto.code,
      },
    });
  }

  async remove(courseId: number, lecturerId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 🔒 Ownership check
    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You are not allowed to delete this course');
    }

    return this.prisma.course.delete({
      where: { id: courseId },
    });
  }

  /**
   * ===============================
   * COURSE MODULES
   * ===============================
   */

  private resolveModuleType(mime: string): ModuleType {
    if (mime.startsWith('video/')) return ModuleType.VIDEO;
    if (mime.includes('powerpoint')) return ModuleType.PPT;
    if (mime.includes('pdf')) return ModuleType.PDF;
    return ModuleType.OTHER;
  }

  async addModule(
    courseId: number,
    dto: CreateCourseModuleDto,
    lecturerId: number,
    file?: Express.Multer.File,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You are not allowed to modify this course');
    }

    if (!file) {
      throw new BadRequestException('Module file is required');
    }

    const fileUrl = `/uploads/modules/${file.filename}`;
    const fileType = this.resolveModuleType(file.mimetype);

    return this.prisma.courseModule.create({
      data: {
        title: dto.title,
        description: dto.description,
        fileUrl,
        fileType,
        courseId,
      },
    });
  }

  async getModules(courseId: number, user: { id: number; role: string }) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { lecturerId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role === 'LECTURER') {
      if (course.lecturerId !== user.id) {
        throw new ForbiddenException('Not your course');
      }
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: user.id,
            courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    }

    return this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
