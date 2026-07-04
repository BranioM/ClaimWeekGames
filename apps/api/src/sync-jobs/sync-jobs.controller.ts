import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InternalApiKeyGuard } from '../security/internal-api-key.guard.js';
import { SyncJobFilters, SyncJobsService } from './sync-jobs.service.js';

@Controller('internal/sync-jobs')
@UseGuards(InternalApiKeyGuard)
export class SyncJobsController {
  constructor(private readonly syncJobsService: SyncJobsService) {}

  @Get()
  listRecentSyncJobs(@Query() query: Record<string, string | undefined>) {
    return this.syncJobsService.listRecentSyncJobs(parseSyncJobFilters(query));
  }
}

function parseSyncJobFilters(
  query: Record<string, string | undefined>,
): SyncJobFilters {
  return {
    status: normalizeQueryValue(query.status),
    jobType: normalizeQueryValue(query.jobType),
    store: normalizeQueryValue(query.store),
    limit: parseLimit(query.limit),
  };
}

function normalizeQueryValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function parseLimit(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : undefined;
}
