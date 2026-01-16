import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nabilah' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Bila@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Bilacantik26' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}
