import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ModuleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly prisma: PrismaService,
    // tanpa S3Service
  ) {}

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

  // Get courses by lecturer ID (for lecturer activity)
  async findByLecturer(lecturerId: number) {
    this.logger.log(`Fetching courses for lecturer ${lecturerId}`);
    return this.prisma.course.findMany({
      where: { lecturerId },
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
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            quizzes: true,
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
          take: 5,
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
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
    try {
      this.logger.log(
        `Lecturer ${lecturerId} creating course: ${dto.code} - ${dto.title}`,
      );

      let imageUrl: string | null = null;
      if (file) {
        // Simpan file lokal atau logic lama di sini
        // Contoh: imageUrl = `/uploads/courses/${file.filename}`;
        imageUrl = `/uploads/courses/${file.filename}`;
      }

      const course = await this.prisma.course.create({
        data: {
          title: dto.title,
          description: dto.description,
          brief: dto.brief,
          imageUrl,
          code: dto.code,
          lecturerId,
        },
      });

      this.logger.log(
        `Course created successfully: ${course.id} (${course.code})`,
      );
      return course;
    } catch (error) {
      this.logger.error(
        `Error creating course for lecturer ${lecturerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(courseId: number, dto: UpdateCourseDto, lecturerId: number) {
    try {
      this.logger.log(`Lecturer ${lecturerId} updating course ${courseId}`);

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        this.logger.warn(`Course not found: ${courseId}`);
        throw new NotFoundException('Course not found');
      }

      // 🔒 Ownership check
      if (course.lecturerId !== lecturerId) {
        this.logger.warn(
          `Lecturer ${lecturerId} attempted to update course ${courseId} owned by ${course.lecturerId}`,
        );
        throw new ForbiddenException(
          'You are not allowed to update this course',
        );
      }

      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: {
          title: dto.title,
          description: dto.description,
          brief: dto.brief,
          code: dto.code,
        },
      });

      this.logger.log(`Course ${courseId} updated successfully`);
      return updatedCourse;
    } catch (error) {
      this.logger.error(
        `Error updating course ${courseId} for lecturer ${lecturerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(courseId: number, lecturerId: number) {
    try {
      this.logger.log(`Lecturer ${lecturerId} deleting course ${courseId}`);

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        this.logger.warn(`Course not found: ${courseId}`);
        throw new NotFoundException('Course not found');
      }

      // 🔒 Ownership check
      if (course.lecturerId !== lecturerId) {
        this.logger.warn(
          `Lecturer ${lecturerId} attempted to delete course ${courseId} owned by ${course.lecturerId}`,
        );
        throw new ForbiddenException(
          'You are not allowed to delete this course',
        );
      }

      const deletedCourse = await this.prisma.course.delete({
        where: { id: courseId },
      });

      this.logger.log(`Course ${courseId} deleted successfully`);
      return deletedCourse;
    } catch (error) {
      this.logger.error(
        `Error deleting course ${courseId} for lecturer ${lecturerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
    try {
      this.logger.log(
        `Lecturer ${lecturerId} adding module to course ${courseId}: ${dto.title}`,
      );

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        this.logger.warn(`Course not found: ${courseId}`);
        throw new NotFoundException('Course not found');
      }

      if (course.lecturerId !== lecturerId) {
        this.logger.warn(
          `Lecturer ${lecturerId} attempted to add module to course ${courseId} owned by ${course.lecturerId}`,
        );
        throw new ForbiddenException(
          'You are not allowed to modify this course',
        );
      }

      if (!file) {
        this.logger.warn(
          `Lecturer ${lecturerId} attempted to add module without file to course ${courseId}`,
        );
        throw new BadRequestException('Module file is required');
      }

      // Simpan file lokal atau logic lama di sini
      const fileUrl = `/uploads/modules/${file.filename}`;
      const fileType = this.resolveModuleType(file.mimetype);

      const module = await this.prisma.courseModule.create({
        data: {
          title: dto.title,
          description: dto.description,
          fileUrl,
          fileType,
          courseId,
        },
      });

      this.logger.log(
        `Module created successfully: ${module.id} in course ${courseId}`,
      );
      return module;
    } catch (error) {
      this.logger.error(
        `Error adding module to course ${courseId} for lecturer ${lecturerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
