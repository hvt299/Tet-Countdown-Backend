import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BauCuaService } from './bau-cua.service';
import { BauCuaGateway } from './bau-cua.gateway';
import { BauCuaController } from './bau-cua.controller';
import { BauCuaLog, BauCuaLogSchema } from './schemas/bau-cua-log.schema';
import { BauCuaBet, BauCuaBetSchema } from './schemas/bau-cua-bet.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BauCuaLog.name, schema: BauCuaLogSchema },
      { name: BauCuaBet.name, schema: BauCuaBetSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [BauCuaController],
  providers: [BauCuaGateway, BauCuaService],
})
export class BauCuaModule {}