import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { submissionMulterConfig } from '../config/multer.submission.config';
import { AssignmentsService } from '../assignments/assignments.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // Alias: submit assignment via /api/submissions
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Post()
  @UseInterceptors(FileInterceptor('file', submissionMulterConfig))
  async submit(
    @Body('assignmentId') assignmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!assignmentId) {
      throw new BadRequestException('assignmentId is required');
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.assignmentsService.submit(assignmentId, file, req.user.id);
  }
}
