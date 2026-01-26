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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { submissionMulterConfig } from '../config/multer.submission.config';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * ===============================
   * GET ASSIGNMENTS
   * ===============================
   */

  // 🔍 Get all assignments (Student & Lecturer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT', 'LECTURER')
  @Get()
  findAll(@Request() req: any) {
    return this.assignmentsService.findAll(req.user);
  }

  // 📚 Get assignments by course (Student & Lecturer)
  @UseGuards(JwtAuthGuard)
  @Get('/course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(Number(courseId));
  }

  // 🔍 Get assignment detail (Student & Lecturer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT', 'LECTURER')
  @Get(':id')
  findOne(@Param('id') assignmentId: string, @Request() req: any) {
    return this.assignmentsService.findOne(assignmentId, req.user);
  }

  /**
   * ===============================
   * LECTURER ONLY
   * ===============================
   */

  // ➕ Create assignment
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Post()
  create(@Body() dto: CreateAssignmentDto, @Request() req) {
    return this.assignmentsService.create(dto, Number(req.user.id));
  }

  // ✏️ Update assignment
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Patch(':id')
  update(
    @Param('id') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
    @Request() req: any,
  ) {
    return this.assignmentsService.update(assignmentId, dto, req.user.id);
  }

  // ❌ Delete assignment
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Delete(':id')
  remove(@Param('id') assignmentId: string, @Request() req: any) {
    return this.assignmentsService.remove(assignmentId, req.user.id);
  }

  /**
   * ===============================
   * STUDENT ONLY
   * ===============================
   */

  // 📤 Submit assignment
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Post(':id/submit')
  @UseInterceptors(FileInterceptor('file', submissionMulterConfig))
  submit(
    @Param('id') assignmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.assignmentsService.submit(assignmentId, file, req.user.id);
  }

  // 📋 Get student's assignments with completion status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Get('/my-assignments/course/:courseId')
  getMyAssignments(@Param('courseId') courseId: string, @Request() req: any) {
    return this.assignmentsService.getStudentAssignments(
      Number(courseId),
      req.user.id,
    );
  }

  /**
   * ===============================
   * LECTURER - VIEW SUBMISSIONS
   * ===============================
   */

  // 📊 Get all submissions for an assignment (Lecturer only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Get(':id/submissions')
  getSubmissions(@Param('id') assignmentId: string, @Request() req: any) {
    return this.assignmentsService.getAssignmentSubmissions(
      assignmentId,
      req.user.id,
    );
  }

  // 📄 Get submission detail (Student & Lecturer)
  @UseGuards(JwtAuthGuard)
  @Get('submission/:submissionId')
  getSubmissionDetail(
    @Param('submissionId') submissionId: string,
    @Request() req: any,
  ) {
    return this.assignmentsService.getSubmissionDetail(
      submissionId,
      req.user.id,
      req.user.role,
    );
  }

  // ⭐ Grade a submission (Lecturer only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Patch('submission/:submissionId/grade')
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @Request() req: any,
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      dto,
      req.user.id,
    );
  }

  // ❌ Reject a submission (Lecturer only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Patch('submission/:submissionId/reject')
  rejectSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: { feedback: string },
    @Request() req: any,
  ) {
    return this.assignmentsService.rejectSubmission(
      submissionId,
      dto,
      req.user.id,
    );
  }
}
