import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TreesService } from './trees.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('trees')
export class TreesController {
  constructor(private readonly treesService: TreesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createTree(@Req() req: any, @Body() dto: CreateTreeDto) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.treesService.create(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMyTrees(@Req() req: any) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.treesService.getMyTrees(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getTree(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    const currentUserId = req?.user?._id?.toString() || req?.user?.userId;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.treesService.getTreeById(id, currentUserId, pageNum, limitNum);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateTree(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateTreeDto,
  ) {
    const userId = req.user?._id?.toString() || req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.treesService.update(id, userId, dto);
  }
}
