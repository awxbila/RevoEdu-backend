import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCourseModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
