import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Calligraphy, CalligraphyDocument } from './schemas/calligraphy.schema';
import { CreateCalligraphyDto } from './dto/create-calligraphy.dto';

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
    const lastRequest = await this.calligraphyModel
      .findOne({ user: userId as any })
      .sort({ createdAt: -1 });

    if (lastRequest) {
      const now = new Date().getTime();
      const lastTime = new Date((lastRequest as any).createdAt).getTime();
      const diffSeconds = (now - lastTime) / 1000;

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

    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    vietnamTime.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(vietnamTime.getTime() - (7 * 60 * 60 * 1000));

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

    let response;

    try {
      try {
        response = await this.genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
      } catch (err25) {
        console.warn('Gemini 2.5 gặp sự cố, đang chuyển sang Gemini 2.0...', err25.message);

        response = await this.genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
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
