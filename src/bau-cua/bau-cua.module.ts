import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BauCuaService } from './bau-cua.service';
import { BauCuaGateway } from './bau-cua.gateway';
import { BauCuaLog, BauCuaLogSchema } from './schemas/bau-cua-log.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BauCuaLog.name, schema: BauCuaLogSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [BauCuaGateway, BauCuaService],
})
export class BauCuaModule {}