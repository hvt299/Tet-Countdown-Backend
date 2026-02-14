import { Controller, Post, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi validation hoặc trùng username/email' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const userObject = (user as any).toObject();
    delete userObject.password;

    return {
      message: 'Đăng ký thành công!',
      data: userObject
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu (cần pass cũ)' })
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }
}