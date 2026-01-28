import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { moduleMulterConfig } from '../config/multer.modules.config';

@ApiTags('Courses')
@ApiBearerAuth('JWT')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  private readonly logger = new Logger(CoursesController.name);

  constructor(private readonly coursesService: CoursesService) {}

  /**
   * ===============================
   * STUDENT & LECTURER
   * ===============================
   */

  // 🔍 Get all courses
  @Roles('STUDENT', 'LECTURER')
  @Get()
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 101,
          title: 'Web Development Basics',
          description:
            'Dasar-dasar web development dengan HTML, CSS, JavaScript',
          code: 'WEB-101',
          imageUrl: null,
          lecturerId: 1,
          lecturer: {
            id: 1,
            name: 'Dr. Budi Santoso',
            email: 'budi@example.com',
            phone: '081234567890',
          },
          assignments: [
            {
              id: 'a-1',
              title: 'Membuat Halaman Login',
              code: 'ASG-LOGIN',
              brief:
                'Buat halaman login dengan email dan password, validasi form.',
              dueDate: '2026-02-15T00:00:00.000Z',
            },
          ],
          quizzes: [
            {
              id: 'q-1',
              title: 'Quiz HTML & CSS Basics',
              description: 'Dasar HTML dan CSS',
              duration: 20,
            },
          ],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.coursesService.findAll();
  }

  //  Get courses by lecturer (for lecturer activity)
  @Roles('LECTURER')
  @Get('my-courses')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get all courses created by the logged-in lecturer',
  })
  async getMyCourses(@Request() req: any) {
    this.logger.log(`GET /courses/my-courses - Lecturer ${req.user.id}`);
    return this.coursesService.findByLecturer(req.user.id);
  }

  @Roles('STUDENT', 'LECTURER')
  @Get(':id')
  @ApiOkResponse({
    schema: {
      example: {
        id: 101,
        title: 'Web Development Basics',
        description: 'Dasar-dasar web development dengan HTML, CSS, JavaScript',
        code: 'WEB-101',
        imageUrl: null,
        lecturerId: 1,
        lecturer: {
          id: 1,
          name: 'Dr. Budi Santoso',
          email: 'budi@example.com',
          phone: '081234567890',
          role: 'LECTURER',
        },
        assignments: [
          {
            id: 'a-1',
            title: 'Membuat Halaman Login',
            code: 'ASG-LOGIN',
            brief:
              'Buat halaman login dengan email dan password. Gunakan form validation.',
            dueDate: '2026-02-15T00:00:00.000Z',
          },
          {
            id: 'a-2',
            title: 'Implementasi Database',
            code: 'ASG-DB',
            brief:
              'Desain database schema untuk users, assignments, submissions, courses.',
            dueDate: '2026-01-20T00:00:00.000Z',
          },
        ],
        quizzes: [
          {
            id: 'q-1',
            title: 'Quiz HTML & CSS Basics',
            description: 'Quiz dasar HTML/CSS',
            duration: 20,
          },
          {
            id: 'q-2',
            title: 'Quiz JavaScript Fundamentals',
            description: 'Konsep dasar JS',
            duration: 15,
          },
        ],
        _count: {
          enrollments: 1,
          assignments: 2,
        },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(Number(id));
  }

  /**
   * ===============================
   * LECTURER ONLY
   * ===============================
   */

  // ➕ Create course
  @Roles('LECTURER')
  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Create a new course. Lecturer ID is automatically taken from JWT token.',
    schema: {
      type: 'object',
      required: ['code', 'title', 'description'],
      properties: {
        code: {
          type: 'string',
          example: 'CS101',
          description: 'Course code (required)',
        },
        title: {
          type: 'string',
          example: 'Introduction to Computer Science',
          description: 'Course title (required)',
        },
        description: {
          type: 'string',
          example: 'Basic concepts of computer science',
          description: 'Course description (required)',
        },
        brief: {
          type: 'string',
          example: 'CS basics',
          description: 'Brief summary (optional)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Course image (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() dto: CreateCourseDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.logger.log(
        `POST /courses - Creating course: ${dto.code} by lecturer ${req.user.id}`,
      );
      this.logger.debug(`File received: ${file ? file.filename : 'none'}`);
      const result = await this.coursesService.create(dto, req.user.id, file);
      this.logger.log(`Course created successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error in POST /courses: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ✏️ Update course
  @Roles('LECTURER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Request() req: any,
  ) {
    return this.coursesService.update(Number(id), dto, req.user.id);
  }

  // 📚 Add course module (ppt/pdf/video)
  @Roles('LECTURER')
  @Post(':id/modules')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Upload course module with file',
    schema: {
      type: 'object',
      required: ['file', 'title'],
      properties: {
        title: {
          type: 'string',
          example: 'Pertemuan 1 - Introduksi',
          description: 'Module title (required)',
        },
        description: {
          type: 'string',
          example: 'Materi pengenalan dasar',
          description: 'Module description (optional)',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF, PPT, or Video file (required)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', moduleMulterConfig))
  async addModule(
    @Param('id') id: string,
    @Body() dto: CreateCourseModuleDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `POST /courses/${id}/modules - Adding module by lecturer ${req.user.id}`,
      );
      if (!file) {
        this.logger.warn(`No file provided for module upload to course ${id}`);
      }
      this.logger.debug(
        `Module file: ${file ? file.filename + ' (' + file.mimetype + ')' : 'none'}`,
      );
      const result = await this.coursesService.addModule(
        Number(id),
        dto,
        req.user.id,
        file,
      );
      this.logger.log(
        `Module added successfully: ${result.id} to course ${id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error in POST /courses/${id}/modules: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // 📂 List course modules (enrolled students & lecturer)
  @Roles('STUDENT', 'LECTURER')
  @Get(':id/modules')
  getModules(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.getModules(Number(id), req.user);
  }

  // ❌ Delete course
  @Roles('LECTURER')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.remove(Number(id), req.user.id);
  }
}
