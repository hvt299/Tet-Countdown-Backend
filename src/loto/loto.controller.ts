import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LotoService } from './loto.service';

@ApiTags('Lô Tô')
@ApiBearerAuth()
@Controller('loto')
export class LotoController {
  constructor(private readonly lotoService: LotoService) { }

  @ApiOperation({ summary: 'Lịch sử mua vé Lô Tô của bản thân' })
  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getMyHistory(@Req() req: any) {
    const userId = req.user.userId;
    return this.lotoService.getUserHistory(userId);
  }
}