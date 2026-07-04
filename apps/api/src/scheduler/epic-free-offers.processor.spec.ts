import { jest } from '@jest/globals';
import { EpicGamesSyncService } from '../epic-games/epic-games-sync.service.js';
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
    expect(epicGamesSyncService.syncFreeGames).toHaveBeenCalledWith(
      'scheduled',
    );
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
    expect(epicGamesSyncService.syncFreeGames).toHaveBeenCalledWith(
      'scheduled',
    );
  });

  it('creates a FAILED SyncJob when scheduled Epic fetch fails', async () => {
    const prisma = {
      store: {
        upsert: jest.fn().mockResolvedValue({ id: 'store-1' }),
      },
      syncJob: {
        create: jest.fn().mockResolvedValue({ id: 'sync-job-1' }),
        update: jest.fn().mockResolvedValue({ id: 'sync-job-1' }),
      },
    };
    const client = {
      getFreeGameOffers: jest
        .fn()
        .mockRejectedValue(new Error('Epic unavailable')),
    };
    const checkout = {
      generateCheckoutUrl: jest.fn(),
    };
    const syncService = new EpicGamesSyncService(
      prisma as never,
      client as never,
      checkout as never,
    );
    const processor = new EpicFreeOffersProcessor(syncService);

    await expect(
      processor.process({
        id: 'bull-job-1',
        name: EPIC_FREE_OFFERS_SYNC_JOB,
      } as never),
    ).rejects.toThrow('Epic unavailable');
    expect(prisma.syncJob.create).toHaveBeenCalledWith({
      data: {
        jobType: 'EPIC_WEEKLY_FREE_OFFERS',
        status: 'PENDING',
        storeId: 'store-1',
        metadata: {
          source: 'scheduled',
        },
      },
    });
    expect(prisma.syncJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sync-job-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          finishedAt: expect.any(Date) as Date,
          error: 'Epic unavailable',
          metadata: expect.objectContaining({
            source: 'scheduled',
            startedAt: expect.any(String) as string,
            finishedAt: expect.any(String) as string,
            durationMs: expect.any(Number) as number,
          }) as unknown,
        }) as unknown,
      }),
    );
  });
});
