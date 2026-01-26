import { IsOptional, IsString } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
