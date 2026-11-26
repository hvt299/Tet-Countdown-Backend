import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tree, TreeSchema } from './schemas/tree.schema';
import { TreesService } from './trees.service';
import { TreesController } from './trees.controller';
import { Gift, GiftSchema } from '../gifts/schemas/gift.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tree.name, schema: TreeSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TreesController],
  providers: [TreesService],
  exports: [TreesService],
})
export class TreesModule {}
