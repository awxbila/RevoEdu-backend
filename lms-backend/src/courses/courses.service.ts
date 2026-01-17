import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

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
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
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
        imageUrl,
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
}
