import { jest } from '@jest/globals';
import { EpicFreeOffersProcessor } from './epic-free-offers.processor.js';
import { EPIC_FREE_OFFERS_SYNC_JOB } from './scheduler.constants.js';

describe('EpicFreeOffersProcessor', () => {
  it('runs the Epic free-offer sync for scheduled jobs', async () => {
    const epicGamesSyncService = {
      syncFreeGames: jest.fn().mockResolvedValue({
        syncJobId: 'sync-job-1',
      }),
    };
    const processor = new EpicFreeOffersProcessor(
      epicGamesSyncService as never,
    );

    await expect(
      processor.process({
        id: 'bull-job-1',
        name: EPIC_FREE_OFFERS_SYNC_JOB,
      } as never),
    ).resolves.toEqual({
      syncJobId: 'sync-job-1',
    });
    expect(epicGamesSyncService.syncFreeGames).toHaveBeenCalledTimes(1);
  });

  it('rethrows failed syncs so BullMQ retry policy can run', async () => {
    const error = new Error('Epic fetch failed');
    const epicGamesSyncService = {
      syncFreeGames: jest.fn().mockRejectedValue(error),
    };
    const processor = new EpicFreeOffersProcessor(
      epicGamesSyncService as never,
    );

    await expect(
      processor.process({
        id: 'bull-job-1',
        name: EPIC_FREE_OFFERS_SYNC_JOB,
      } as never),
    ).rejects.toThrow('Epic fetch failed');
    expect(epicGamesSyncService.syncFreeGames).toHaveBeenCalledTimes(1);
  });
});
