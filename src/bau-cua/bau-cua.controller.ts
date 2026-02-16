import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BauCuaService } from './bau-cua.service';

@ApiTags('Bầu Cua Tôm Cá')
@ApiBearerAuth()
@Controller('bau-cua')
export class BauCuaController {
    constructor(private readonly bauCuaService: BauCuaService) { }

    @ApiOperation({ summary: 'Lịch sử cược Bầu Cua của bản thân' })
    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getMyHistory(@Req() req: any) {
        const userId = req.user.userId;
        return this.bauCuaService.getUserHistory(userId);
    }
}
