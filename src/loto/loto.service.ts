import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { Solar } from 'lunar-javascript';
import { LotoSession, LotoSessionDocument } from './schemas/loto-session.schema';
import { LotoTicket, LotoTicketDocument } from './schemas/loto-ticket.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { generateLotoTicket } from './utils/loto-generator.util';

export type LotoGameState = 'BUYING' | 'DRAWING' | 'CLOSED';

@Injectable()
export class LotoService {
  private readonly logger = new Logger(LotoService.name);
  public server: Server;

  private currentState: LotoGameState = 'CLOSED';
  private remainingTime: number = 0;
  private drawRemainingTime: number = 0;

  private currentSessionId: string = '';
  private currentJackpot: number = 0;
  private drawnNumbers: number[] = [];
  private availableNumbers: number[] = [];

  private playerTickets: Map<string, number[][][]> = new Map();
  private totalTicketsSold: number = 0;

  private readonly TICKET_PRICE = 10;
  private readonly MAX_TICKETS = 3;
  private readonly TIME_BUYING = 600;
  private readonly TIME_DRAWING = 10;

  constructor(
    @InjectModel(LotoSession.name) private lotoSessionModel: Model<LotoSessionDocument>,
    @InjectModel(LotoTicket.name) private lotoTicketModel: Model<LotoTicketDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.startGameLoop();
  }

  private checkTetTime(): boolean {
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const solar = Solar.fromYmd(vnTime.getFullYear(), vnTime.getMonth() + 1, vnTime.getDate());
    const lunar = solar.getLunar();

    let isTet = lunar.getMonth() === 1 && lunar.getDay() >= 4 && lunar.getDay() <= 6;
    return isTet;
  }

  private startGameLoop() {
    setInterval(() => {
      const isTet = this.checkTetTime();

      if (!isTet) {
        if (this.currentState !== 'CLOSED') {
          this.currentState = 'CLOSED';
          this.remainingTime = 0;
          this.logger.log('🔒 ĐÃ ĐÓNG SẢNH LÔ TÔ');
          this.broadcastGameState();
        }
        return;
      }

      if (this.currentState === 'CLOSED') {
        this.startNewSession();
      }

      if (this.currentState === 'BUYING') {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          this.startDrawingPhase();
        }
      } else if (this.currentState === 'DRAWING') {
        this.drawRemainingTime--;
        if (this.drawRemainingTime <= 0) {
          this.drawNextNumber();
        }
      }

      this.broadcastGameState();
    }, 1000);
  }

  private startNewSession() {
    this.currentState = 'BUYING';
    this.remainingTime = this.TIME_BUYING;
    this.currentSessionId = Date.now().toString();
    this.drawnNumbers = [];
    this.availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    this.playerTickets.clear();
    this.totalTicketsSold = 0;

    if (this.currentJackpot === 0) {
      this.logger.log(`🎟️ VÁN MỚI BẮT ĐẦU! (Mã ván: ${this.currentSessionId})`);
    } else {
      this.logger.log(`🔥 VÁN MỚI BẮT ĐẦU (JACKPOT CỘNG DỒN: ${this.currentJackpot})`);
    }
  }

  private startDrawingPhase() {
    if (this.totalTicketsSold === 0) {
      this.logger.log(`⏩ Không có ai mua vé, bỏ qua bước Kêu Lô Tô -> Khởi động lại ván mới!`);
      this.startNewSession();
      return;
    }

    this.currentState = 'DRAWING';
    this.drawRemainingTime = this.TIME_DRAWING;
    this.logger.log(`⏳ HẾT GIỜ BÁN VÉ -> BẮT ĐẦU KÊU LÔ TÔ (Tổng vé bán: ${this.totalTicketsSold})`);
  }

  private async drawNextNumber() {
    if (this.availableNumbers.length === 0) {
      this.logger.log('💨 Đã kêu hết 90 số mà không ai Kinh! CỘNG DỒN JACKPOT!');
      await this.endSession(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.availableNumbers.length);
    const drawnNum = this.availableNumbers.splice(randomIndex, 1)[0];

    this.drawnNumbers.push(drawnNum);
    this.drawRemainingTime = this.TIME_DRAWING;

    this.logger.log(`🎙️ Cờ ra con mấy, con mấy gì ra... Số: ${drawnNum}`);
  }

  public async buyTicket(userId: string) {
    if (this.currentState !== 'BUYING') throw new Error('Đã hết giờ mua vé, sòng đang quay số!');

    const userTickets = this.playerTickets.get(userId) || [];
    if (userTickets.length >= this.MAX_TICKETS) {
      throw new Error(`Bạn chỉ được mua tối đa ${this.MAX_TICKETS} vé mỗi ván!`);
    }

    const user = await this.userModel.findById(userId);
    if (!user || user.coins < this.TICKET_PRICE) {
      throw new Error('Số dư của bạn không đủ để mua vé!');
    }

    await this.userModel.findByIdAndUpdate(userId, { $inc: { coins: -this.TICKET_PRICE } });

    const newTicket = generateLotoTicket();
    userTickets.push(newTicket);
    this.playerTickets.set(userId, userTickets);

    this.totalTicketsSold++;
    this.currentJackpot += this.TICKET_PRICE;

    this.logger.log(`🎫 User [${userId}] vừa mua 1 vé Lô Tô. Jackpot: ${this.currentJackpot}`);
    this.broadcastGameState();

    return newTicket;
  }

  public getPlayerTickets(userId: string) {
    return this.playerTickets.get(userId) || [];
  }

  private countWaitingKinh(): number {
    if (this.currentState !== 'DRAWING') return 0;
    let waitingUsers = 0;

    for (const [userId, tickets] of this.playerTickets.entries()) {
      let isUserWaiting = false;
      for (const ticket of tickets) {
        for (let r = 0; r < 3; r++) {
          let matchCount = 0;
          let targetCount = 0;
          for (let c = 0; c < 9; c++) {
            const num = ticket[r][c];
            if (num > 0) {
              targetCount++;
              if (this.drawnNumbers.includes(num)) matchCount++;
            }
          }

          if (targetCount === 5 && matchCount === 4) {
            isUserWaiting = true;
            break;
          }
        }
        if (isUserWaiting) break;
      }
      if (isUserWaiting) waitingUsers++;
    }
    return waitingUsers;
  }

  public async callKinh(userId: string, ticketIndex: number) {
    if (this.currentState !== 'DRAWING') throw new Error('Ván đấu chưa bắt đầu kêu số!');

    const userTickets = this.playerTickets.get(userId);
    if (!userTickets || !userTickets[ticketIndex]) {
      throw new Error('Vé không hợp lệ!');
    }

    const ticket = userTickets[ticketIndex];
    let isWin = false;

    for (let r = 0; r < 3; r++) {
      let matchCount = 0;
      let targetCount = 0;

      for (let c = 0; c < 9; c++) {
        const num = ticket[r][c];
        if (num > 0) {
          targetCount++;
          if (this.drawnNumbers.includes(num)) {
            matchCount++;
          }
        }
      }

      if (targetCount === 5 && matchCount === 5) {
        isWin = true;
        break;
      }
    }

    if (isWin) {
      this.currentState = 'CLOSED';
      this.logger.log(`🎉 BINGO! User [${userId}] đã KINH thành công! Ẵm Jackpot: ${this.currentJackpot}`);
      await this.userModel.findByIdAndUpdate(userId, { $inc: { coins: this.currentJackpot } });

      const winJackpot = this.currentJackpot;
      await this.endSession(userId);
      return winJackpot;
    } else {
      const PENALTY = 100;
      this.logger.warn(`🤡 User [${userId}] báo KINH SAI! Bị phạt ${PENALTY} xu.`);
      await this.userModel.findByIdAndUpdate(userId, { $inc: { coins: -PENALTY } });
      throw new Error(`Vé chưa đủ điều kiện KINH! Bạn bị phạt trừ ${PENALTY} xu.`);
    }
  }

  private async endSession(winnerId: string | null) {
    if (this.totalTicketsSold > 0) {
      try {
        await this.lotoSessionModel.create({
          sessionId: this.currentSessionId,
          drawnNumbers: [...this.drawnNumbers],
          winnerId: winnerId,
          jackpot: this.currentJackpot,
          status: winnerId ? 'FINISHED' : 'ROLLOVER'
        });

        const ticketDocs: any[] = [];
        for (const [uId, tickets] of this.playerTickets.entries()) {
          for (const t of tickets) {
            ticketDocs.push({
              sessionId: this.currentSessionId,
              userId: uId,
              matrix: t,
              price: this.TICKET_PRICE
            });
          }
        }
        await this.lotoTicketModel.insertMany(ticketDocs);
        this.logger.log(`💾 Đã lưu DB Lô Tô ván ${this.currentSessionId}`);

      } catch (error) {
        this.logger.error('Lỗi lưu DB Lô Tô', error);
      }
    }

    if (this.server) {
      this.server.emit('loto:sessionEnded', {
        winnerId: winnerId,
        jackpot: this.currentJackpot,
        message: winnerId ? 'Có người đã KINH thành công!' : 'Ván đấu không ai Kinh, Jackpot được cộng dồn!'
      });
    }

    if (winnerId) {
      this.currentJackpot = 0;
    }

    this.startNewSession();
  }

  public getCurrentState() {
    return {
      state: this.currentState,
      time: this.currentState === 'BUYING' ? this.remainingTime : this.drawRemainingTime,
      sessionId: this.currentSessionId,
      jackpot: this.currentJackpot,
      drawnNumbers: this.drawnNumbers,
      totalTicketsSold: this.totalTicketsSold,
      playerCount: this.playerTickets.size,
      waitingKinhCount: this.countWaitingKinh()
    };
  }

  async getUserHistory(userId: string) {
    return this.lotoTicketModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  private broadcastGameState() {
    if (this.server) {
      this.server.emit('loto:timeUpdate', this.getCurrentState());
    }
  }
}