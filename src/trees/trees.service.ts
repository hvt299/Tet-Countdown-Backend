import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lunar } from 'lunar-javascript';

import { Tree, TreeDocument, TreeStatus } from './schemas/tree.schema';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { Gift, GiftDocument } from '../gifts/schemas/gift.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class TreesService {
  constructor(
    @InjectModel(Tree.name)
    private readonly treeModel: Model<TreeDocument>,
    @InjectModel(Gift.name)
    private readonly giftModel: Model<GiftDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private checkValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ!');
    }
  }

  /**
   * Tính thời điểm mở lì xì: 00:00 ngày Mùng 1 Tết (theo lịch âm) của năm cây.
   */
  public getTetUnlockTimestamp(year: number): number {
    try {
      const solar = Lunar.fromYmd(year, 1, 1).getSolar();
      const sMonth = String(solar.getMonth()).padStart(2, '0');
      const sDay = String(solar.getDay()).padStart(2, '0');
      return new Date(`${solar.getYear()}-${sMonth}-${sDay}T00:00:00+07:00`).getTime();
    } catch {
      // Fallback nếu không parse được: mặc định 10/02 của năm
      return new Date(`${year}-02-10T00:00:00+07:00`).getTime();
    }
  }

  public canRevealContents(year: number): boolean {
    return Date.now() >= this.getTetUnlockTimestamp(year);
  }

  async create(ownerId: string, dto: CreateTreeDto) {
    this.checkValidObjectId(ownerId);

    const existingTree = await this.treeModel.findOne({
      ownerId: new Types.ObjectId(ownerId),
      year: dto.year,
    });

    if (existingTree) {
      throw new ConflictException(`Bạn đã tạo Cây Tết cho năm ${dto.year} rồi!`);
    }

    const tree = await this.treeModel.create({
      ownerId: new Types.ObjectId(ownerId),
      year: dto.year,
      name: dto.name.trim(),
      theme: dto.theme?.trim() || 'mai',
      status: TreeStatus.ACTIVE,
    });

    return tree;
  }

  async getMyTrees(ownerId: string) {
    this.checkValidObjectId(ownerId);

    return this.treeModel
      .find({ ownerId: new Types.ObjectId(ownerId), status: TreeStatus.ACTIVE })
      .sort({ year: -1 })
      .lean();
  }

  async getTreeById(
    treeId: string,
    currentUserId?: string,
    page = 1,
    limit = 12,
  ) {
    this.checkValidObjectId(treeId);

    const tree = await this.treeModel
      .findById(treeId)
      .populate('ownerId', 'fullName username avatar')
      .lean();

    if (!tree) {
      throw new NotFoundException('Không tìm thấy Cây Tết này!');
    }

    const contentsUnlocked = this.canRevealContents(tree.year);
    const isOwner = Boolean(
      currentUserId &&
        tree.ownerId &&
        (tree.ownerId as any)._id?.toString() === currentUserId,
    );

    const skip = (Math.max(1, page) - 1) * limit;

    const [gifts, totalGifts] = await Promise.all([
      this.giftModel
        .find({ treeId: new Types.ObjectId(treeId) })
        .populate('senderId', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.giftModel.countDocuments({ treeId: new Types.ObjectId(treeId) }),
    ]);

    const sanitizedGifts = gifts.map((g: any) => {
      const isSender = Boolean(
        currentUserId && g.senderId?._id?.toString() === currentUserId,
      );
      const shouldShowContent = contentsUnlocked || isSender;

      return {
        _id: g._id,
        treeId: g.treeId,
        sender: g.senderId,
        receiverId: g.receiverId,
        theme: g.theme,
        ornamentType: g.ornamentType,
        isOpened: g.isOpened,
        openedAt: g.openedAt,
        createdAt: g.createdAt,
        content: shouldShowContent ? g.content : undefined,
        contentsUnlocked,
      };
    });

    return {
      tree,
      isOwner,
      contentsUnlocked,
      unlockAt: this.getTetUnlockTimestamp(tree.year),
      pagination: {
        page,
        limit,
        totalGifts,
        totalPages: Math.ceil(totalGifts / limit) || 1,
      },
      gifts: sanitizedGifts,
    };
  }

  async update(treeId: string, ownerId: string, dto: UpdateTreeDto) {
    this.checkValidObjectId(treeId);
    this.checkValidObjectId(ownerId);

    const tree = await this.treeModel.findById(treeId);
    if (!tree) {
      throw new NotFoundException('Không tìm thấy Cây Tết!');
    }

    if (tree.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa cây này!');
    }

    if (dto.name) tree.name = dto.name.trim();
    if (dto.theme) tree.theme = dto.theme.trim();

    await tree.save();
    return tree;
  }
}
