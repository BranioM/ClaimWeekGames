import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  EPIC_FREE_OFFERS_SYNC_CRON,
  EPIC_FREE_OFFERS_SYNC_CRON_ENV,
  EPIC_FREE_OFFERS_SYNC_ENABLED,
  EPIC_FREE_OFFERS_SYNC_JOB,
  EPIC_FREE_OFFERS_SYNC_SCHEDULER_ID,
  EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
  EPIC_FREE_OFFERS_SYNC_TIMEZONE_ENV,
  EPIC_SYNC_QUEUE,
} from './scheduler.constants.js';

@Injectable()
export class EpicFreeOffersSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(EpicFreeOffersSchedulerService.name);

  constructor(
    @InjectQueue(EPIC_SYNC_QUEUE) private readonly queue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.isSchedulerEnabled()) {
      this.logger.log('Epic free-offer scheduler registration is disabled');
      return;
    }

    await this.registerWeeklySync();
  }

  async registerWeeklySync(): Promise<void> {
    const cron = this.getCronPattern();
    const timezone = this.getTimezone();

    await this.queue.add(
      EPIC_FREE_OFFERS_SYNC_JOB,
      {},
      {
        jobId: EPIC_FREE_OFFERS_SYNC_SCHEDULER_ID,
        repeat: {
          pattern: cron,
          tz: timezone,
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
      `Registered Epic free-offer sync with cron "${cron}" in ${timezone}`,
    );
  }

  isSchedulerEnabled(): boolean {
    const configuredValue = this.configService.get<string>(
      EPIC_FREE_OFFERS_SYNC_ENABLED,
    );

    if (configuredValue !== undefined) {
      return configuredValue.toLowerCase() === 'true';
    }

    const nodeEnv = this.configService.get<string>('NODE_ENV');

    return nodeEnv !== 'test' && nodeEnv !== 'production';
  }

  private getCronPattern(): string {
    return (
      this.configService.get<string>(EPIC_FREE_OFFERS_SYNC_CRON_ENV) ??
      EPIC_FREE_OFFERS_SYNC_CRON
    );
  }

  private getTimezone(): string {
    return (
      this.configService.get<string>(EPIC_FREE_OFFERS_SYNC_TIMEZONE_ENV) ??
      EPIC_FREE_OFFERS_SYNC_TIME_ZONE
    );
  }
}
