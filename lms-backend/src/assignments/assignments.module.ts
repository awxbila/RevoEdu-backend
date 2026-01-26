import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { SubmissionsController } from '../submissions/submissions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController, SubmissionsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
