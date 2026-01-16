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
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * ===============================
   * GET ASSIGNMENTS
   * ===============================
   */

  // 📚 Get assignments by course (Student & Lecturer)
  @UseGuards(JwtAuthGuard)
  @Get('/course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(Number(courseId));
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
  submit(
    @Param('id') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
    @Request() req: any,
  ) {
    return this.assignmentsService.submit(assignmentId, dto, req.user.id);
  }
}
