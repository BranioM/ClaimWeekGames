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

    await expect(
      controller.listRecentSyncJobs({
        status: 'SUCCEEDED',
        jobType: 'EPIC_WEEKLY_FREE_OFFERS',
        store: 'Epic Games Store',
        limit: '25',
      }),
    ).resolves.toEqual([{ id: 'sync-job-1', status: 'SUCCEEDED' }]);
    expect(service.listRecentSyncJobs).toHaveBeenCalledWith({
      status: 'SUCCEEDED',
      jobType: 'EPIC_WEEKLY_FREE_OFFERS',
      store: 'Epic Games Store',
      limit: 25,
    });
  });
});
