import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from './player/player.module';
import { GameModule } from './game/game.module';
import { PairingRequestModule } from './pairing-request/pairing-request.module';
import { PairingModule } from './pairing/pairing.module';
import { DailyResultModule } from './daily-result/daily.result.module';
import { FinalScoreModule } from './final-score/final.score.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_DIR || '/app/data/standup-saboteur.db',
      synchronize: true,
      autoLoadEntities: true,
    }),
    PlayerModule,
    GameModule,
    PairingRequestModule,
    PairingModule,
    DailyResultModule,
    FinalScoreModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
