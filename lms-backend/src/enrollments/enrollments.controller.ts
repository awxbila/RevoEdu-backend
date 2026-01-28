import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

import { EnrollmentsService } from './enrollments.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * ===============================
   * STUDENT
   * ===============================
   */

  // ➕ Enroll to course
  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Enroll student to a course' })
  @ApiBody({ type: EnrollCourseDto })
  enrollCourse(@Body() dto: EnrollCourseDto, @Request() req: any) {
    return this.enrollmentsService.enrollCourse(
      req.user.id,
      Number(dto.courseId),
    );
  }

  // 📚 View my enrollments
  @Get('me')
  @Roles('STUDENT')
  getMyEnrollments(@Request() req: any) {
    return this.enrollmentsService.getStudentEnrollments(req.user.id);
  }

  // ✏️ Update my enrollment (semester/status)
  @Patch(':id')
  @Roles('STUDENT')
  updateEnrollment(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
    @Request() req: any,
  ) {
    return this.enrollmentsService.updateEnrollment(
      Number(id),
      req.user.id,
      dto,
    );
  }

  // ❌ Unenroll from course
  @Delete('course/:courseId')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Unenroll from a course' })
  unenrollCourse(@Param('courseId') courseId: string, @Request() req: any) {
    return this.enrollmentsService.unenrollCourse(
      req.user.id,
      Number(courseId),
    );
  }

  /**
   * ===============================
   * LECTURER
   * ===============================
   */

  // 👨‍🎓 Get all students enrolled in a specific course
  @Get('course/:courseId')
  @Roles('LECTURER')
  getStudentsByCourse(
    @Param('courseId') courseId: string,
    @Request() req: any,
  ) {
    return this.enrollmentsService.getStudentsByCourse(
      Number(courseId),
      req.user.id,
    );
  }

  // 👨‍🎓 Get enrollments (generic - lists all enrollments, useful for debugging)
  @Get()
  @Roles('LECTURER', 'STUDENT')
  @ApiOperation({ summary: 'Get enrollments (for debugging)' })
  getAllEnrollments(@Request() req: any) {
    // If student, return their own enrollments
    // If lecturer, return empty (use GET /course/:courseId instead)
    if (req.user.role === 'STUDENT') {
      return this.enrollmentsService.getStudentEnrollments(req.user.id);
    }
    return {
      message:
        'Use GET /enrollments/course/:courseId to view students in your course',
    };
  }
}
