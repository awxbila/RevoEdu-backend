// create-assignment.dto.ts
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  brief?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsInt()
  courseId: number; // ✅ HARUS number
}
