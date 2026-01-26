import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiProperty({ example: 'Web Development Basics', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Dasar-dasar web development dengan HTML, CSS, JavaScript',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'WEB-101', required: false })
  @IsString()
  @IsOptional()
  code?: string;
}
