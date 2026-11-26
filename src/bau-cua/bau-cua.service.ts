import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { Solar } from 'lunar-javascript';
import { BauCuaLog, BauCuaLogDocument } from './schemas/bau-cua-log.schema';
import { BauCuaBet, BauCuaBetDocument } from './schemas/bau-cua-bet.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

export type GameState = 'BETTING' | 'SHAKING' | 'RESULT' | 'CLOSED';

@Injectable()
export class BauCuaService {
  private readonly logger = new Logger(BauCuaService.name);
  public server: Server;

  private currentState: GameState = 'CLOSED';
  private remainingTime: number = 0;

  private currentSessionId: string = '';
  private currentResult: string[] = [];

  private totalBets: Record<string, number> = { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 };
  private playerBets: Map<string, Record<string, number>> = new Map();

  private readonly FACES = ['bau', 'cua', 'tom', 'ca', 'ga', 'nai'];

  private readonly TIME_BETTING = 60;
  private readonly TIME_SHAKING = 10;
  private readonly TIME_RESULT = 10;

  constructor(
    @InjectModel(BauCuaLog.name) private bauCuaLogModel: Model<BauCuaLogDocument>,
    @InjectModel(BauCuaBet.name) private bauCuaBetModel: Model<BauCuaBetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.startGameLoop();
  }

  private checkTetTime(): boolean {
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const solar = Solar.fromYmd(vnTime.getFullYear(), vnTime.getMonth() + 1, vnTime.getDate());
    const lunar = solar.getLunar();

    let isTet = lunar.getMonth() === 1 && lunar.getDay() >= 1 && lunar.getDay() <= 3;
    return isTet;
  }

  private startGameLoop() {
    setInterval(() => {
      const isTet = this.checkTetTime();

      if (!isTet) {
        if (this.currentState !== 'CLOSED') {
          this.currentState = 'CLOSED';
          this.remainingTime = 0;
          this.logger.log('🔒 ĐÃ ĐÓNG SÒNG BẦU CUA');
        }
      } else {
        if (this.currentState === 'CLOSED') {
          this.startNewSession();
        }

        this.remainingTime--;

        if (this.remainingTime <= 0) {
          this.transitionState();
        }
      }

      this.broadcastGameState();
    }, 1000);
  }

  private startNewSession() {
    this.currentState = 'BETTING';
    this.remainingTime = this.TIME_BETTING;
    this.currentSessionId = Date.now().toString();
    this.currentResult = [];

    this.totalBets = { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 };
    this.playerBets.clear();

    this.logger.log(`🎲 VÁN MỚI BẮT ĐẦU! (Mã ván: ${this.currentSessionId})`);
  }

  public async placeBet(userId: string, animal: string, amount: number) {
    if (this.currentState === 'CLOSED') {
      throw new Error('Sòng Bầu Cua chỉ mở cửa vào 3 ngày Tết (Mùng 1, 2, 3). Hẹn gặp lại bạn nhé!');
    }

    if (!userId) {
      throw new Error('Không xác định được danh tính người chơi!');
    }

    if (this.currentState !== 'BETTING') {
      throw new Error('Đã hết thời gian đặt cược!');
    }

    if (!this.FACES.includes(animal)) {
      throw new Error('Linh vật không hợp lệ!');
    }

    if (amount <= 0) {
      throw new Error('Số tiền cược không hợp lệ!');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng!');
    }

    let currentTotalBet = 0;
    if (this.playerBets.has(userId)) {
      const userBets = this.playerBets.get(userId)!;
      currentTotalBet = Object.values(userBets).reduce((a, b) => a + b, 0);
    }

    if (user.coins < currentTotalBet + amount) {
      throw new Error('Số dư của bạn không đủ để cược mức này!');
    }

    if (!this.playerBets.has(userId)) {
      this.playerBets.set(userId, { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 });
    }
    const userBet = this.playerBets.get(userId)!;
    userBet[animal] += amount;

    this.totalBets[animal] += amount;

    this.logger.log(`💰 User [${userId}] vừa cược ${amount} xu vào [${animal.toUpperCase()}]`);

    this.broadcastGameState();
  }

  public clearBets(userId: string) {
    if (this.currentState !== 'BETTING') {
      throw new Error('Chỉ có thể hủy cược khi đang trong thời gian đặt cược!');
    }

    const userBets = this.playerBets.get(userId);
    if (!userBets) return 0;

    let totalRefund = 0;

    for (const animal of this.FACES) {
      const amount = userBets[animal];
      if (amount > 0) {
        this.totalBets[animal] -= amount;
        totalRefund += amount;
        userBets[animal] = 0;
      }
    }

    if (totalRefund > 0) {
      this.logger.log(`🔄 User [${userId}] đã hủy cược, hoàn lại ${totalRefund} xu`);
      this.playerBets.delete(userId);
      this.broadcastGameState();
    }

    return totalRefund;
  }

  public getPlayerBets(userId: string) {
    return this.playerBets.get(userId) || { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 };
  }

  public getCurrentState(): GameState {
    return this.currentState;
  }

  public getSessionData(userId?: string) {
    return {
      state: this.currentState,
      time: this.remainingTime,
      sessionId: this.currentSessionId || '',
      totalBets: this.totalBets,
      playerCount: this.playerBets.size,
      result: this.currentState === 'RESULT' ? this.currentResult : [],
      myBets: userId ? this.getPlayerBets(userId) : { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 },
    };
  }

  private rollDice(): string[] {
    return [
      this.FACES[Math.floor(Math.random() * 6)],
      this.FACES[Math.floor(Math.random() * 6)],
      this.FACES[Math.floor(Math.random() * 6)],
    ];
  }

  private async transitionState() {
    switch (this.currentState) {
      case 'BETTING':
        this.currentState = 'SHAKING';
        this.remainingTime = this.TIME_SHAKING;
        this.logger.log(`⏳ HẾT GIỜ CƯỢC -> ĐANG XÓC ĐĨA...`);
        break;

      case 'SHAKING':
        this.currentState = 'RESULT';
        this.remainingTime = this.TIME_RESULT;

        this.currentResult = this.rollDice();
        this.logger.log(`🎉 MỞ BÁT: ${this.currentResult.join(' - ').toUpperCase()}`);

        let totalBetAll = 0;
        let totalPayoutAll = 0;

        const resultCount = { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 };
        this.currentResult.forEach(animal => resultCount[animal]++);

        for (const [userId, bets] of this.playerBets.entries()) {
          let userNetProfit = 0;

          for (const animal of this.FACES) {
            const betAmount = bets[animal];
            if (betAmount > 0) {
              totalBetAll += betAmount;

              if (resultCount[animal] > 0) {
                const winAmount = betAmount * resultCount[animal];
                userNetProfit += winAmount;
                totalPayoutAll += (betAmount + winAmount);
              } else {
                userNetProfit -= betAmount;
              }
            }
          }

          if (userNetProfit !== 0) {
            this.userModel.findByIdAndUpdate(userId, {
              $inc: { coins: userNetProfit }
            }).exec().catch(err => this.logger.error(`Lỗi cộng tiền user ${userId}`, err));

            this.logger.log(`💸 User [${userId}] ${userNetProfit > 0 ? 'thắng' : 'thua'} ${Math.abs(userNetProfit)} xu`);

            try {
              await this.bauCuaBetModel.create({
                userId: userId,
                sessionId: this.currentSessionId,
                bets: { ...bets },
                result: this.currentResult,
                netProfit: userNetProfit
              });
            } catch (err) {
              this.logger.error('Lỗi lưu lịch sử cược cá nhân', err);
            }
          }
        }

        if (totalBetAll > 0) {
          try {
            await this.bauCuaLogModel.create({
              sessionId: this.currentSessionId,
              result: this.currentResult,
              totalBet: totalBetAll,
              totalPayout: totalPayoutAll,
            });
            this.logger.log(`💾 Đã lưu lịch sử ván ${this.currentSessionId} (Tổng cược: ${totalBetAll})`);
          } catch (error) {
            this.logger.error('Lỗi khi lưu lịch sử Bầu Cua', error);
          }
        } else {
          this.logger.log(`💨 Ván ${this.currentSessionId} không có ai cược, bỏ qua lưu Database.`);
        }
        break;

      case 'RESULT':
        this.startNewSession();
        break;
    }
  }

  private broadcastGameState() {
    if (this.server) {
      this.server.emit('bauCua:timeUpdate', {
        state: this.currentState,
        time: this.remainingTime,
        sessionId: this.currentSessionId,
        totalBets: this.totalBets,
        playerCount: this.playerBets.size,
        result: this.currentState === 'RESULT' ? this.currentResult : [],
      });
    }
  }

  async getUserHistory(userId: string) {
    return this.bauCuaBetModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }
}