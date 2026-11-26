import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Calligraphy, CalligraphyDocument } from './schemas/calligraphy.schema';
import { CreateCalligraphyDto } from './dto/create-calligraphy.dto';
import { Solar } from 'lunar-javascript';

@Injectable()
export class CalligraphyService {
  private genAI: GoogleGenAI;

  constructor(
    @InjectModel(Calligraphy.name) private calligraphyModel: Model<CalligraphyDocument>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenAI({ apiKey });
  }

  // async onModuleInit() {
  //   console.log('===== AVAILABLE GEMINI MODELS =====');

  //   const pager = await this.genAI.models.list();

  //   for await (const model of pager) {
  //     console.log(model.name);
  //   }

  //   console.log('===================================');
  // }

  async giveWord(createDto: CreateCalligraphyDto, userId: string, ip: string): Promise<Calligraphy> {
    const nowTime = new Date();
    const vnTime = new Date(nowTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const solar = Solar.fromYmd(vnTime.getFullYear(), vnTime.getMonth() + 1, vnTime.getDate());
    const lunar = solar.getLunar();

    let isTet = lunar.getMonth() === 1 && lunar.getDay() >= 1 && lunar.getDay() <= 10;

    if (!isTet) {
      throw new HttpException(
        'Ông Đồ chỉ mở cửa cho chữ từ lúc Giao Thừa đến hết Mùng 10 Âm lịch. Hẹn gặp lại bạn nhé!',
        HttpStatus.FORBIDDEN,
      );
    }

    const lastRequest = await this.calligraphyModel
      .findOne({ user: userId as any })
      .sort({ createdAt: -1 });

    if (lastRequest) {
      const currentTimeMs = nowTime.getTime();
      const lastTimeMs = new Date((lastRequest as any).createdAt).getTime();
      const diffSeconds = (currentTimeMs - lastTimeMs) / 1000;

      const COOLDOWN_TIME = 600;

      if (diffSeconds < COOLDOWN_TIME) {
        const timeLeft = COOLDOWN_TIME - diffSeconds;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);

        throw new HttpException(
          `Ông Đồ đang bận mài mực. Vui lòng đợi ${minutes} phút ${seconds} giây nữa nhé!`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const vietnamTimeNow = new Date(nowTime.getTime() + (7 * 60 * 60 * 1000));
    vietnamTimeNow.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(vietnamTimeNow.getTime() - (7 * 60 * 60 * 1000));

    const countToday = await this.calligraphyModel.countDocuments({
      user: userId as any,
      createdAt: { $gte: startOfDay },
    });

    if (countToday >= 3) {
      throw new HttpException(
        'Hôm nay bạn đã xin 3 chữ rồi. Hãy quay lại vào ngày mai nhé!',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const { userName, userWish } = createDto;

    const prompt = `
      Bạn là một Ông Đồ già uyên bác, am hiểu Hán Nôm và văn hóa Tết Việt Nam.
      
      Người xin chữ: "${userName}"
      Mong muốn/Lời cầu nguyện: "${userWish}"
      
      Hãy tặng người này 1 chữ Hán (hoặc chữ Nôm) ý nghĩa nhất phù hợp với mong muốn của họ.
      
      Yêu cầu đầu ra: CHỈ TRẢ VỀ DUY NHẤT MỘT CHUỖI JSON (không markdown, không giải thích thêm) theo định dạng sau:
      {
        "givenWord": "Chữ Hán",
        "vietnameseMeaning": "Nghĩa tiếng Việt ngắn gọn (1-2 từ)",
        "content": "Lời giải thích ý nghĩa của chữ này (khoảng 2 câu)",
        "poem": "Một bài thơ tứ tuyệt (4 câu) để tặng người này"
      }
    `;

    // CHUỖI MÔ HÌNH DỰ PHÒNG THEO THỨ TỰ ƯU TIÊN: 3.6 Flash -> 2.5 Flash
    const FALLBACK_MODELS = [
      'gemini-3.6-flash',
      'gemini-2.5-flash',
    ];

    let response: any = null;
    let successfulModel = '';

    try {
      for (const modelName of FALLBACK_MODELS) {
        try {
          response = await this.genAI.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          });

          if (response && response.text) {
            successfulModel = modelName;
            console.log(`[Ông Đồ AI] Tạo chữ thành công với mô hình: ${modelName}`);
            break;
          }
        } catch (modelErr: any) {
          console.warn(
            `[Ông Đồ AI] Mô hình ${modelName} gặp sự cố, chuyển sang mô hình tiếp theo... Chi tiết: ${modelErr?.message || modelErr}`,
          );
        }
      }

      if (!response || !response.text) {
        throw new Error('Tất cả mô hình Gemini đều quá tải hoặc không khả dụng.');
      }

      const rawText = response.text || '{}';
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');

      let aiData;
      if (firstBrace !== -1 && lastBrace !== -1) {
        const cleanJson = rawText.substring(firstBrace, lastBrace + 1);
        aiData = JSON.parse(cleanJson);
      } else {
        throw new Error('Invalid JSON Format received from AI');
      }

      const newCalligraphy = new this.calligraphyModel({
        user: userId,
        userName: userName,
        userWish: userWish,
        givenWord: aiData.givenWord,
        vietnameseMeaning: aiData.vietnameseMeaning,
        poem: aiData.poem,
        content: aiData.content,
        ipAddress: ip,
      });

      return await newCalligraphy.save();

    } catch (error: any) {
      console.error('Lỗi Ông Đồ (Cả 2 Model đều thất bại):', error);

      if (
        error.status === 429 ||
        error.response?.status === 429 ||
        (error.message && error.message.includes('429'))
      ) {
        throw new HttpException(
          'Mực đã cạn, nghiên đã khô\nÔng Đồ xin hẹn khách ngày mai tái ngộ!',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new InternalServerErrorException(
        'Ông Đồ đang bận mài mực, vui lòng thử lại sau giây lát!',
      );
    }
  }

  async findAllByUser(userId: string): Promise<Calligraphy[]> {
    return this.calligraphyModel.find({ user: userId } as any).sort({ createdAt: -1 }).exec();
  }

  async findRecent(): Promise<Calligraphy[]> {
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentYear = vietnamTime.getUTCFullYear();
    const startOfYearVN = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
    const startOfYearUTC = new Date(startOfYearVN.getTime() - (7 * 60 * 60 * 1000));

    return this.calligraphyModel.find({ createdAt: { $gte: startOfYearUTC } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'fullName avatar')
      .exec();
  }

  async findByIdPublic(id: string): Promise<Calligraphy> {
    const item = await this.calligraphyModel.findById(id).populate('user', 'fullName avatar').exec();
    if (!item) {
      throw new HttpException('Không tìm thấy bức thư pháp này!', HttpStatus.NOT_FOUND);
    }
    return item;
  }
}
