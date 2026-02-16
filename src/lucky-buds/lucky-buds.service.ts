import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wish, WishDocument } from './schemas/wish.schema';
import { LuckyLog, LuckyLogDocument } from './schemas/lucky-log.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Solar } from 'lunar-javascript';

@Injectable()
export class LuckyBudsService {
  constructor(
    @InjectModel(Wish.name) private wishModel: Model<WishDocument>,
    @InjectModel(LuckyLog.name) private luckyLogModel: Model<LuckyLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async pickLuckyBud(userId: string) {
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

    const solar = Solar.fromYmd(vnTime.getFullYear(), vnTime.getMonth() + 1, vnTime.getDate());
    const lunar = solar.getLunar();

    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();

    let isTet = lunarMonth === 1 && lunarDay >= 1 && lunarDay <= 3;
    let isGiaoThua = lunarMonth === 1 && lunarDay === 1 && vnTime.getHours() === 0;

    if (!isTet) {
      throw new BadRequestException('Hội hái lộc chỉ mở vào 3 ngày Tết (Mùng 1, 2, 3). Hẹn gặp lại bạn năm sau nhé!');
    }

    const vietnamTimeNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    vietnamTimeNow.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(vietnamTimeNow.getTime() - (7 * 60 * 60 * 1000));
    const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);

    const alreadyPicked = await this.luckyLogModel.findOne({
      userId: userId,
      pickedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (alreadyPicked) {
      throw new BadRequestException('Hôm nay bạn đã hái lộc rồi. Hãy quay lại vào ngày mai nhé!');
    }

    let coinsReceived = 0;
    const random = Math.random() * 100;
    const currentYear = new Date().getFullYear();

    if (isGiaoThua) {
      if (random < 40) coinsReceived = this.randomBetween([68, 88]);
      else if (random < 70) coinsReceived = this.randomBetween([168, 288]);
      else if (random < 90) coinsReceived = this.randomBetween([888, 999]);
      else coinsReceived = this.randomBetween([1000, currentYear]);
    } else {
      if (random < 50) coinsReceived = this.randomBetween([68, 88]);
      else if (random < 80) coinsReceived = this.randomBetween([168, 288]);
      else if (random < 95) coinsReceived = this.randomBetween([888, 999]);
      else coinsReceived = this.randomBetween([1000, currentYear]);
    }

    const coinMeaning = this.getCoinMeaning(coinsReceived, currentYear);

    const randomWishArray = await this.wishModel.aggregate([{ $sample: { size: 1 } }]);
    const wishContent = randomWishArray.length > 0 ? randomWishArray[0].content : 'Chúc bạn năm mới An Khang Thịnh Vượng! 🧧';
    const wishId = randomWishArray.length > 0 ? randomWishArray[0]._id : null;

    const newLog = new this.luckyLogModel({
      userId: userId,
      wishId: wishId,
      coinsReceived: coinsReceived,
      pickedAt: new Date(),
    });
    await newLog.save();

    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { coins: coinsReceived }
    });

    return {
      id: newLog._id,
      message: 'Hái lộc thành công!',
      coins: coinsReceived,
      coinMeaning: coinMeaning,
      wish: wishContent,
      isGiaoThua: isGiaoThua
    };
  }

  private randomBetween(values: number[]): number {
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
  }

  private getCoinMeaning(coin: number, currentYear: number): string {
    const meanings: Record<number, string> = {
      68: 'Lộc Phát',
      88: 'Phát Phát',
      168: 'Mãi Lộc',
      288: 'Mãi Phát',
      888: 'Phát Phát Phát',
      999: 'Vĩnh Cửu trường tồn',
      1000: 'Khởi đầu mới rực rỡ'
    };

    if (coin === currentYear) return 'Năm mới thăng hoa, rực rỡ';
    return meanings[coin] || 'Tài lộc đong đầy';
  }

  async getHistory(userId: string) {
    return this.luckyLogModel.find({ userId })
      .populate('wishId', 'content type')
      .sort({ pickedAt: -1 })
      .exec();
  }

  async getLuckyBudById(id: string) {
    try {
      const log = await this.luckyLogModel.findById(id)
        .populate('userId', 'fullName username avatar')
        .populate('wishId', 'content type')
        .exec();

      if (!log) throw new BadRequestException('Không tìm thấy lộc này!');

      return {
        id: log._id,
        user: log.userId,
        wish: log.wishId,
        coinsReceived: log.coinsReceived,
        pickedAt: log.pickedAt
      };
    } catch (error) {
      throw new BadRequestException('ID không hợp lệ hoặc dữ liệu không tồn tại!');
    }
  }
}