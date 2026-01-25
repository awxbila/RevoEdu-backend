import { IsString, IsNotEmpty, IsIn, IsInt, Min } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  optionA: string;

  @IsString()
  @IsNotEmpty()
  optionB: string;

  @IsString()
  @IsNotEmpty()
  optionC: string;

  @IsString()
  @IsNotEmpty()
  optionD: string;

  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  correctAnswer: string;

  @IsInt()
  @Min(1)
  order: number;
}
