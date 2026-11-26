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

import { CreateGiftDto, UpdateGiftDto } from './dto/create-gift.dto';
import { Gift, GiftDocument, GiftOrnamentType } from './schemas/gift.schema';
import { Tree, TreeDocument, TreeStatus } from '../trees/schemas/tree.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class GiftsService {
  constructor(
    @InjectModel(Gift.name)
    private readonly giftModel: Model<GiftDocument>,
    @InjectModel(Tree.name)
    private readonly treeModel: Model<TreeDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private checkValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ!');
    }
  }

  public getTetUnlockTimestamp(year: number): number {
    try {
      const solar = Lunar.fromYmd(year, 1, 1).getSolar();
      const sMonth = String(solar.getMonth()).padStart(2, '0');
      const sDay = String(solar.getDay()).padStart(2, '0');
      return new Date(`${solar.getYear()}-${sMonth}-${sDay}T00:00:00+07:00`).getTime();
    } catch {
      return new Date(`${year}-02-10T00:00:00+07:00`).getTime();
    }
  }

  public canRevealContents(year: number): boolean {
    return Date.now() >= this.getTetUnlockTimestamp(year);
  }

  async sendGift(senderId: string, dto: CreateGiftDto) {
    this.checkValidObjectId(senderId);
    this.checkValidObjectId(dto.treeId);

    const tree = await this.treeModel.findById(dto.treeId);
    if (!tree || tree.status !== TreeStatus.ACTIVE) {
      throw new NotFoundException('Cây Tết không tồn tại hoặc đã đóng!');
    }

    const existingGift = await this.giftModel.findOne({
      treeId: new Types.ObjectId(dto.treeId),
      senderId: new Types.ObjectId(senderId),
    });

    if (existingGift) {
      throw new ConflictException('Bạn đã gửi lì xì cho Cây Tết này rồi!');
    }

    const gift = await this.giftModel.create({
      treeId: tree._id,
      senderId: new Types.ObjectId(senderId),
      receiverId: tree.ownerId,
      content: dto.content.trim(),
      theme: dto.theme?.trim() || 'red_lixi',
      ornamentType: dto.ornamentType || GiftOrnamentType.LIXI,
      isOpened: false,
      openedAt: null,
    });

    return gift;
  }

  async getSentGifts(senderId: string) {
    this.checkValidObjectId(senderId);

    return this.giftModel
      .find({ senderId: new Types.ObjectId(senderId) })
      .populate('receiverId', 'fullName username avatar')
      .populate('treeId', 'name year theme status')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getGiftById(giftId: string, currentUserId?: string) {
    this.checkValidObjectId(giftId);

    const gift = await this.giftModel
      .findById(giftId)
      .populate('senderId', 'fullName username avatar')
      .populate('treeId', 'name year theme')
      .lean();

    if (!gift) {
      throw new NotFoundException('Không tìm thấy phong bao này!');
    }

    const treeYear = (gift.treeId as any)?.year || new Date().getFullYear();
    const contentsUnlocked = this.canRevealContents(treeYear);
    const isSender = Boolean(
      currentUserId && (gift.senderId as any)?._id?.toString() === currentUserId,
    );
    const isReceiver = Boolean(
      currentUserId && (gift.receiverId as any)?.toString() === currentUserId,
    );

    const shouldShow = contentsUnlocked || isSender || (isReceiver && gift.isOpened);

    return {
      ...gift,
      content: shouldShow ? gift.content : undefined,
      contentsUnlocked,
      canEdit: isSender && !gift.isOpened && !contentsUnlocked,
    };
  }

  async openGift(giftId: string, receiverId: string) {
    this.checkValidObjectId(giftId);
    this.checkValidObjectId(receiverId);

    const gift = await this.giftModel
      .findById(giftId)
      .populate('treeId', 'year')
      .populate('senderId', 'fullName username avatar');

    if (!gift) {
      throw new NotFoundException('Không tìm thấy phong bao!');
    }

    if (gift.receiverId.toString() !== receiverId) {
      throw new ForbiddenException('Bạn không phải chủ nhân của phong bao này!');
    }

    const treeYear = (gift.treeId as any)?.year || new Date().getFullYear();
    if (!this.canRevealContents(treeYear)) {
      throw new ForbiddenException(
        'Phong bao lì xì chỉ được mở vào đúng thời khắc Giao Thừa!',
      );
    }

    if (!gift.isOpened) {
      gift.isOpened = true;
      gift.openedAt = new Date();
      await gift.save();
    }

    return gift;
  }

  async updateGift(giftId: string, senderId: string, dto: UpdateGiftDto) {
    this.checkValidObjectId(giftId);
    this.checkValidObjectId(senderId);

    const gift = await this.giftModel.findById(giftId).populate('treeId', 'year');
    if (!gift) {
      throw new NotFoundException('Không tìm thấy phong bao!');
    }

    if (gift.senderId.toString() !== senderId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa phong bao này!');
    }

    if (gift.isOpened) {
      throw new ForbiddenException('Phong bao đã được mở, không thể sửa!');
    }

    if (dto.content) gift.content = dto.content.trim();
    if (dto.theme) gift.theme = dto.theme.trim();
    if (dto.ornamentType) gift.ornamentType = dto.ornamentType;

    await gift.save();
    return gift;
  }
}
