import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyResultEntity } from './daily.result.entity';
import { DailyResultController } from './daily.result.controller';
import {
  DAILY_RESULT_REPOSITORY,
  DailyResultRepositoryImpl,
} from './daily.result.repository';
import * as UseCases from './use-cases';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyResultEntity]), // Add entities here when needed
    PlayerModule,
  ],
  controllers: [DailyResultController],
  providers: [
    ...Object.values(UseCases),
    {
      provide: DAILY_RESULT_REPOSITORY,
      useClass: DailyResultRepositoryImpl,
    },
    Logger,
  ],
})
export class DailyResultModule {}
