import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EpicGamesModule } from '../epic-games/epic-games.module.js';
import { EpicFreeOffersProcessor } from './epic-free-offers.processor.js';
import { EpicFreeOffersSchedulerService } from './epic-free-offers-scheduler.service.js';
import { EPIC_SYNC_QUEUE } from './scheduler.constants.js';
import { parseRedisConnection } from './redis-connection.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: parseRedisConnection(
          configService.get<string>('REDIS_URL'),
        ),
      }),
    }),
    BullModule.registerQueue({
      name: EPIC_SYNC_QUEUE,
    }),
    EpicGamesModule,
  ],
  providers: [EpicFreeOffersSchedulerService, EpicFreeOffersProcessor],
})
export class SchedulerModule {}
