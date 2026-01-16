import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollCourseDto {
  @ApiProperty({
    example: '1',
    description: 'Course ID to enroll to',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
