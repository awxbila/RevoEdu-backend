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
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  /**
   * ===============================
   * LECTURER ENDPOINTS
   * ===============================
   */

  // 📝 Create quiz with questions
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Post()
  create(@Body() dto: CreateQuizDto, @Request() req: any) {
    return this.quizzesService.create(dto, req.user.id);
  }

  // ✏️ Update quiz
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Patch(':id')
  update(
    @Param('id') quizId: string,
    @Body() dto: UpdateQuizDto,
    @Request() req: any,
  ) {
    return this.quizzesService.update(quizId, dto, req.user.id);
  }

  // ❌ Delete quiz
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Delete(':id')
  delete(@Param('id') quizId: string, @Request() req: any) {
    return this.quizzesService.delete(quizId, req.user.id);
  }

  // 📊 Get all submissions for a quiz
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LECTURER')
  @Get(':id/submissions')
  getQuizSubmissions(@Param('id') quizId: string, @Request() req: any) {
    return this.quizzesService.getQuizSubmissions(quizId, req.user.id);
  }

  /**
   * ===============================
   * STUDENT & LECTURER ENDPOINTS
   * ===============================
   */

  // 📚 Get all quizzes by course
  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId')
  findAllByCourse(@Param('courseId') courseId: string, @Request() req: any) {
    return this.quizzesService.findAllByCourse(
      Number(courseId),
      req.user.id,
      req.user.role,
    );
  }

  // 📚 Get all quizzes for the logged-in student (across enrollments)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Get('student')
  findAllForStudent(@Request() req: any) {
    return this.quizzesService.findAllForStudent(req.user.id);
  }

  // 🔍 Get quiz detail
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') quizId: string, @Request() req: any) {
    return this.quizzesService.findOne(quizId, req.user.id, req.user.role);
  }

  // 📄 Get submission detail
  @UseGuards(JwtAuthGuard)
  @Get('submission/:submissionId')
  getSubmissionDetail(
    @Param('submissionId') submissionId: string,
    @Request() req: any,
  ) {
    return this.quizzesService.getSubmissionDetail(
      submissionId,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * ===============================
   * STUDENT ENDPOINTS
   * ===============================
   */

  // ✅ Submit quiz answers
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Post(':id/submit')
  submitQuiz(
    @Param('id') quizId: string,
    @Body() dto: SubmitQuizDto,
    @Request() req: any,
  ) {
    return this.quizzesService.submitQuiz(quizId, dto, req.user.id);
  }
}
