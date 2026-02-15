import { Controller, Post, Get, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LuckyBudsService } from './lucky-buds.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Lucky Buds (Hái Lộc)')
@Controller('lucky-buds')
export class LuckyBudsController {
  constructor(private readonly luckyBudsService: LuckyBudsService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hái lộc đầu năm' })
  @ApiResponse({ status: 201, description: 'Hái lộc thành công, trả về Xu, Câu chúc và ID để chia sẻ.' })
  @ApiResponse({ status: 400, description: 'Chưa tới khung giờ hoặc hôm nay đã hái rồi.' })
  @UseGuards(AuthGuard('jwt'))
  @Post('pick')
  async pickLuckyBud(@Req() req: any) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng từ Token!');
    }
    return this.luckyBudsService.pickLuckyBud(userId);
  }

  @ApiOperation({ summary: 'Xem chi tiết lộc để chia sẻ (Public)' })
  @ApiParam({ name: 'id', description: 'ID của lượt hái lộc (LuckyLog ID)' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin người hái, lời chúc và số xu.' })
  @Get(':id')
  async getLuckyBudById(@Param('id') id: string) {
    return this.luckyBudsService.getLuckyBudById(id);
  }
}