import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalligraphyService } from './calligraphy.service';
import { CalligraphyController } from './calligraphy.controller';
import { Calligraphy, CalligraphySchema } from './schemas/calligraphy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Calligraphy.name, schema: CalligraphySchema }]),
  ],
  controllers: [CalligraphyController],
  providers: [CalligraphyService],
})
export class CalligraphyModule {}