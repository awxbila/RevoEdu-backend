import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

import { EnrollmentsService } from './enrollments.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';

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

  // 👨‍🎓 View students in a course
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
}
