import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    // Check if email is being changed and if it's already taken
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password if provided
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    if (file) {
      updateData.profileImageUrl = `/uploads/profiles/${file.filename}`;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getLecturerDetail(lecturerId: number) {
    const lecturer = await this.prisma.user.findUnique({
      where: { id: lecturerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    if (lecturer.role !== 'LECTURER') {
      throw new NotFoundException('User is not a lecturer');
    }

    return lecturer;
  }
}
