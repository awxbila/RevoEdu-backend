import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Service } from '../common/s3.service';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService, S3Service],
  exports: [CoursesService],
})
export class CoursesModule {}
