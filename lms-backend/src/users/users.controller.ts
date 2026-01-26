import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { profileMulterConfig } from '../config/multer.profile.config';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 👤 Get current user profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  // ✏️ Update current user profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('image', profileMulterConfig))
  updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req.user.id, dto, file);
  }

  // 👨‍🏫 Get lecturer detail
  @UseGuards(JwtAuthGuard)
  @Get('lecturer/:id')
  getLecturerDetail(@Param('id') id: string) {
    return this.usersService.getLecturerDetail(Number(id));
  }
}
