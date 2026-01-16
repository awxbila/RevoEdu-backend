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
      data: dto,
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
}
