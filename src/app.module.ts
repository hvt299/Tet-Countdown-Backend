import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CalligraphyModule } from './calligraphy/calligraphy.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { LuckyBudsModule } from './lucky-buds/lucky-buds.module';
import { BauCuaModule } from './bau-cua/bau-cua.module';
import { LotoModule } from './loto/loto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    EmailModule,
    CalligraphyModule,
    UsersModule,
    AuthModule,
    LuckyBudsModule,
    BauCuaModule,
    LotoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
