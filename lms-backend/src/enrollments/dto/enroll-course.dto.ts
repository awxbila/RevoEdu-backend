import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollCourseDto {
  @ApiProperty({
    example: '101',
    description: 'Course ID to enroll to',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    example: 'Genap',
    required: false,
    description: 'Semester (opsional)',
  })
  @IsString()
  semester?: string;
}
