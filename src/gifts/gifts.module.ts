import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gift, GiftSchema } from './schemas/gift.schema';
import { GiftsService } from './gifts.service';
import { GiftsController } from './gifts.controller';
import { Tree, TreeSchema } from '../trees/schemas/tree.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gift.name, schema: GiftSchema },
      { name: Tree.name, schema: TreeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
