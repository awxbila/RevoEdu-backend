import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Web Development Basics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Dasar-dasar web development dengan HTML, CSS, JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Penjelasan singkat course yang bisa dilihat semua student',
    required: false,
  })
  @IsString()
  @IsOptional()
  brief?: string;

  @ApiPropertyOptional({ example: 'WEB-101' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: any;
}
