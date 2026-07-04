import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EPIC_FREE_OFFERS_SYNC_CRON,
  EPIC_FREE_OFFERS_SYNC_JOB,
  EPIC_FREE_OFFERS_SYNC_SCHEDULER_ID,
  EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
  EPIC_SYNC_QUEUE,
} from './scheduler.constants.js';

@Injectable()
export class EpicFreeOffersSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(EpicFreeOffersSchedulerService.name);

  constructor(@InjectQueue(EPIC_SYNC_QUEUE) private readonly queue: Queue) {}

  async onModuleInit(): Promise<void> {
    await this.registerWeeklySync();
  }

  async registerWeeklySync(): Promise<void> {
    await this.queue.add(
      EPIC_FREE_OFFERS_SYNC_JOB,
      {},
      {
        jobId: EPIC_FREE_OFFERS_SYNC_SCHEDULER_ID,
        repeat: {
          pattern: EPIC_FREE_OFFERS_SYNC_CRON,
          tz: EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
        },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60_000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );

    this.logger.log(
      `Registered Epic free-offer sync for Thursdays at 18:00 ${EPIC_FREE_OFFERS_SYNC_TIME_ZONE}`,
    );
  }
}
