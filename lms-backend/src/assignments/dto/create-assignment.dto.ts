// create-assignment.dto.ts
import { IsInt, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  courseId: number; // ✅ HARUS number
}
