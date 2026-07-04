import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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

@Injectable()
export class SyncJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async listRecentSyncJobs(limit = 50): Promise<SyncJobView[]> {
    const jobs = await this.prisma.syncJob.findMany({
      take: limit,
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
