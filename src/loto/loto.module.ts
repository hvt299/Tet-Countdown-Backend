import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LotoService } from './loto.service';
import { LotoGateway } from './loto.gateway';
import { LotoController } from './loto.controller';
import { LotoSession, LotoSessionSchema } from './schemas/loto-session.schema';
import { LotoTicket, LotoTicketSchema } from './schemas/loto-ticket.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LotoSession.name, schema: LotoSessionSchema },
      { name: LotoTicket.name, schema: LotoTicketSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LotoController],
  providers: [LotoService, LotoGateway],
})
export class LotoModule {}