import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiProperty({ example: 'Backend Development', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Learn NestJS from scratch', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'WEB-101', required: false })
  @IsString()
  @IsOptional()
  code?: string;
}
