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
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
  findAll() {
    return this.coursesService.findAll();
  }

  // 🔍 Get course detail
  @Roles('STUDENT', 'LECTURER')
  @Get(':id')
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

  // ❌ Delete course
  @Roles('LECTURER')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.remove(Number(id), req.user.id);
  }
}
