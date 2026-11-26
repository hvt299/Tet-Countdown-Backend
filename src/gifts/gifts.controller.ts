import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GiftsService } from './gifts.service';
import { CreateGiftDto, UpdateGiftDto } from './dto/create-gift.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async sendGift(@Req() req: any, @Body() dto: CreateGiftDto) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.giftsService.sendGift(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sent')
  async getSentGifts(@Req() req: any) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.giftsService.getSentGifts(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getGift(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    return this.giftsService.getGiftById(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/open')
  async openGift(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.giftsService.openGift(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateGift(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateGiftDto,
  ) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.giftsService.updateGift(id, userId, dto);
  }
}
