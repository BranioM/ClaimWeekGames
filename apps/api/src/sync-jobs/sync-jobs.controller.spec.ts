import { jest } from '@jest/globals';
import { SyncJobsController } from './sync-jobs.controller.js';

describe('SyncJobsController', () => {
  it('lists recent sync jobs through the service', async () => {
    const service = {
      listRecentSyncJobs: jest.fn().mockResolvedValue([
        {
          id: 'sync-job-1',
          status: 'SUCCEEDED',
        },
      ]),
    };
    const controller = new SyncJobsController(service as never);

    await expect(controller.listRecentSyncJobs()).resolves.toEqual([
      {
        id: 'sync-job-1',
        status: 'SUCCEEDED',
      },
    ]);
  });
});
