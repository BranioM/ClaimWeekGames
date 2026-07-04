import { jest } from '@jest/globals';
import { SyncJobsService } from './sync-jobs.service.js';

describe('SyncJobsService', () => {
  it('returns API-safe recent sync jobs', async () => {
    const prisma = {
      syncJob: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'sync-job-1',
            jobType: 'EPIC_WEEKLY_FREE_OFFERS',
            status: 'SUCCEEDED',
            startedAt: new Date('2026-07-04T00:00:00.000Z'),
            finishedAt: new Date('2026-07-04T00:01:00.000Z'),
            error: null,
            metadata: { offersSynced: 1 },
            createdAt: new Date('2026-07-04T00:00:00.000Z'),
            updatedAt: new Date('2026-07-04T00:01:00.000Z'),
            store: {
              id: 'store-1',
              name: 'Epic Games Store',
            },
            connectedAccount: null,
          },
        ]),
      },
    };
    const service = new SyncJobsService(prisma as never);

    await expect(service.listRecentSyncJobs()).resolves.toEqual([
      {
        id: 'sync-job-1',
        jobType: 'EPIC_WEEKLY_FREE_OFFERS',
        status: 'SUCCEEDED',
        startedAt: '2026-07-04T00:00:00.000Z',
        finishedAt: '2026-07-04T00:01:00.000Z',
        error: undefined,
        metadata: { offersSynced: 1 },
        createdAt: '2026-07-04T00:00:00.000Z',
        updatedAt: '2026-07-04T00:01:00.000Z',
        store: {
          id: 'store-1',
          name: 'Epic Games Store',
        },
        connectedAccount: undefined,
      },
    ]);
  });
});
