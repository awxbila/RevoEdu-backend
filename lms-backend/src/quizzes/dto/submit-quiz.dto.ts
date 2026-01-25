import {
  IsArray,
  IsString,
  IsIn,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  selectedAnswer: string;
}

export class SubmitQuizDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Harus menjawab minimal 1 pertanyaan' })
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
