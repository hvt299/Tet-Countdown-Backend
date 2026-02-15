import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LuckyBudsService } from './lucky-buds.service';
import { LuckyBudsController } from './lucky-buds.controller';
import { Wish, WishSchema } from './schemas/wish.schema';
import { LuckyLog, LuckyLogSchema } from './schemas/lucky-log.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wish.name, schema: WishSchema },
      { name: LuckyLog.name, schema: LuckyLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LuckyBudsController],
  providers: [LuckyBudsService],
})
export class LuckyBudsModule {}