import { Controller, Post, UseGuards, Request, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập lấy Token' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('verify')
  async verifyAccount(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi link quên mật khẩu' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới từ link email' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}