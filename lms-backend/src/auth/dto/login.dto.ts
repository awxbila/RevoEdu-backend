import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'Bila@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Bilacantik26' })
  @IsString()
  password: string;
}
