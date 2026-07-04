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
      const result = await this.epicGamesSyncService.syncFreeGames();

      this.logger.log(
        `Completed scheduled Epic free-offer sync with SyncJob ${result.syncJobId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Scheduled Epic free-offer sync failed for BullMQ job ${job.id ?? 'unknown'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}
