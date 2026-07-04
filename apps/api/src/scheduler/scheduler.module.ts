import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EpicGamesModule } from '../epic-games/epic-games.module.js';
import { EpicFreeOffersSchedulerService } from './epic-free-offers-scheduler.service.js';

@Module({
  imports: [ScheduleModule.forRoot(), EpicGamesModule],
  providers: [EpicFreeOffersSchedulerService],
})
export class SchedulerModule {}
