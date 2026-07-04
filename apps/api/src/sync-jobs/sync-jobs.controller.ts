import { Controller, Get, UseGuards } from '@nestjs/common';
import { InternalApiKeyGuard } from '../security/internal-api-key.guard.js';
import { SyncJobsService } from './sync-jobs.service.js';

@Controller('internal/sync-jobs')
@UseGuards(InternalApiKeyGuard)
export class SyncJobsController {
  constructor(private readonly syncJobsService: SyncJobsService) {}

  @Get()
  listRecentSyncJobs() {
    return this.syncJobsService.listRecentSyncJobs();
  }
}
