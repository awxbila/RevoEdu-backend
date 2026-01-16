import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitAssignmentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
