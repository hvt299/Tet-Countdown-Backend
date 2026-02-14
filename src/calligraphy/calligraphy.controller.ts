import { Controller, Post, Body, UseGuards, Request, Ip, Get, Param } from '@nestjs/common';
import { CalligraphyService } from './calligraphy.service';
import { CreateCalligraphyDto } from './dto/create-calligraphy.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Calligraphy (Ông Đồ)')
@ApiBearerAuth()
@Controller('calligraphy')
export class CalligraphyController {
  constructor(private readonly calligraphyService: CalligraphyService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('ask')
  @ApiOperation({ summary: 'Xin chữ đầu năm (Gọi AI)' })
  async askOngDo(
    @Body() createDto: CreateCalligraphyDto,
    @Request() req,
    @Ip() ip: string
  ) {
    const userId = req.user.userId;
    return this.calligraphyService.giveWord(createDto, userId, ip);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  @ApiOperation({ summary: 'Xem lịch sử xin chữ của bản thân' })
  async getMyHistory(@Request() req) {
    return this.calligraphyService.findAllByUser(req.user.userId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Xem 10 người xin chữ gần nhất (năm hiện tại)' })
  async getRecent() {
    return this.calligraphyService.findRecent();
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Xem chi tiết 1 bức thư pháp qua Link chia sẻ (Public)' })
  async getPublicCalligraphy(@Param('id') id: string) {
    return this.calligraphyService.findByIdPublic(id);
  }
}
