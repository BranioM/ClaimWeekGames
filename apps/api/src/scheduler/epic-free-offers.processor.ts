import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EpicGamesSyncService } from '../epic-games/epic-games-sync.service.js';
import {
  EPIC_FREE_OFFERS_SYNC_JOB,
  EPIC_SYNC_QUEUE,
} from './scheduler.constants.js';

@Processor(EPIC_SYNC_QUEUE)
export class EpicFreeOffersProcessor extends WorkerHost {
  private readonly logger = new Logger(EpicFreeOffersProcessor.name);

  constructor(private readonly epicGamesSyncService: EpicGamesSyncService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name !== EPIC_FREE_OFFERS_SYNC_JOB) {
      this.logger.warn(`Ignoring unsupported scheduler job: ${job.name}`);
      return undefined;
    }

    try {
      const result = await this.epicGamesSyncService.syncFreeGames('scheduled');

      this.logger.log(
        `Completed scheduled Epic free-offer sync with SyncJob ${result.syncJobId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Scheduled Epic free-offer sync failed for BullMQ job ${job.id ?? 'unknown'}`,
        getSafeLogMessage(error),
      );

      throw error;
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
