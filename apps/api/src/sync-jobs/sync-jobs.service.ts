import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const DEFAULT_SYNC_JOB_LIMIT = 50;
const MAX_SYNC_JOB_LIMIT = 100;
const SYNC_JOB_STATUSES = new Set([
  'PENDING',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
]);

export type SyncJobView = {
  id: string;
  jobType: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
  };
  connectedAccount?: {
    id: string;
    externalAccountId?: string;
    displayName?: string;
  };
};

export type SyncJobFilters = {
  status?: string;
  jobType?: string;
  store?: string;
  limit?: number;
};

@Injectable()
export class SyncJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async listRecentSyncJobs(
    filters: SyncJobFilters = {},
  ): Promise<SyncJobView[]> {
    const where = buildSyncJobWhere(filters);
    const limit = normalizeLimit(filters.limit);

    const jobs = await this.prisma.syncJob.findMany({
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
        connectedAccount: true,
      },
    });

    return jobs.map((job) => ({
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      startedAt: job.startedAt?.toISOString(),
      finishedAt: job.finishedAt?.toISOString(),
      error: job.error ?? undefined,
      metadata: job.metadata ?? undefined,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      store: job.store
        ? {
            id: job.store.id,
            name: job.store.name,
          }
        : undefined,
      connectedAccount: job.connectedAccount
        ? {
            id: job.connectedAccount.id,
            externalAccountId:
              job.connectedAccount.externalAccountId ?? undefined,
            displayName: job.connectedAccount.displayName ?? undefined,
          }
        : undefined,
    }));
  }
}

function buildSyncJobWhere(filters: SyncJobFilters): Prisma.SyncJobWhereInput {
  const where: Prisma.SyncJobWhereInput = {};

  if (filters.status && SYNC_JOB_STATUSES.has(filters.status)) {
    where.status = filters.status as Prisma.SyncJobWhereInput['status'];
  }

  if (filters.jobType) {
    where.jobType = filters.jobType;
  }

  if (filters.store) {
    where.store = {
      is: {
        OR: [{ id: filters.store }, { name: filters.store }],
      },
    };
  }

  return where;
}

function normalizeLimit(limit?: number): number {
  if (!limit || !Number.isInteger(limit) || limit < 1) {
    return DEFAULT_SYNC_JOB_LIMIT;
  }

  return Math.min(limit, MAX_SYNC_JOB_LIMIT);
}
