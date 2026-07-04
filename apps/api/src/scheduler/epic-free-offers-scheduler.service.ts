import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EpicGamesSyncService } from '../epic-games/epic-games-sync.service.js';
import {
  EPIC_FREE_OFFERS_SYNC_CRON,
  EPIC_FREE_OFFERS_SYNC_CRON_ENV,
  EPIC_FREE_OFFERS_SYNC_ENABLED,
  EPIC_FREE_OFFERS_SYNC_JOB_NAME,
  EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
  EPIC_FREE_OFFERS_SYNC_TIMEZONE_ENV,
} from './scheduler.constants.js';

@Injectable()
export class EpicFreeOffersSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(EpicFreeOffersSchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly epicGamesSyncService: EpicGamesSyncService,
  ) {}

  onModuleInit(): void {
    if (!this.isSchedulerEnabled()) {
      this.logger.log('Epic free-offer scheduler registration is disabled');
      return;
    }

    this.registerWeeklySync();
  }

  registerWeeklySync(): void {
    const cron = this.getCronPattern();
    const timezone = this.getTimezone();

    if (
      this.schedulerRegistry.doesExist('cron', EPIC_FREE_OFFERS_SYNC_JOB_NAME)
    ) {
      this.schedulerRegistry.deleteCronJob(EPIC_FREE_OFFERS_SYNC_JOB_NAME);
    }

    const job = CronJob.from({
      cronTime: cron,
      onTick: () => {
        void this.runScheduledSync();
      },
      start: false,
      timeZone: timezone,
      waitForCompletion: true,
      errorHandler: (error) => {
        this.logger.error(
          `Scheduled Epic free-offer sync failed: ${getSafeLogMessage(error)}`,
        );
      },
      name: EPIC_FREE_OFFERS_SYNC_JOB_NAME,
    });

    this.schedulerRegistry.addCronJob(EPIC_FREE_OFFERS_SYNC_JOB_NAME, job);
    job.start();

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

  async runScheduledSync(): Promise<void> {
    try {
      const result = await this.epicGamesSyncService.syncFreeGames('scheduled');

      this.logger.log(
        `Completed scheduled Epic free-offer sync with SyncJob ${result.syncJobId}`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled Epic free-offer sync failed: ${getSafeLogMessage(error)}`,
      );
    }
  }
}

function getSafeLogMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : 'Unknown Epic sync failure';

  return message
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(
      /(token|password|secret|cookie|api[_-]?key)=([^&\s]+)/gi,
      '$1=[REDACTED]',
    )
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 500);
}
