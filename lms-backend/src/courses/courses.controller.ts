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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
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

  // 🔍 Get course detail
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  create(
    @Body() dto: CreateCourseDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.create(dto, req.user.id, file);
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
  @UseInterceptors(FileInterceptor('file', moduleMulterConfig))
  addModule(
    @Param('id') id: string,
    @Body() dto: CreateCourseModuleDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.coursesService.addModule(Number(id), dto, req.user.id, file);
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
