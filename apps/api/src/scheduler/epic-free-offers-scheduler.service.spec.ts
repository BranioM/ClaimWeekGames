import { jest } from '@jest/globals';
import { EpicFreeOffersSchedulerService } from './epic-free-offers-scheduler.service.js';
import {
  EPIC_FREE_OFFERS_SYNC_CRON,
  EPIC_FREE_OFFERS_SYNC_JOB,
  EPIC_FREE_OFFERS_SYNC_SCHEDULER_ID,
  EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
} from './scheduler.constants.js';

describe('EpicFreeOffersSchedulerService', () => {
  it('registers the weekly Epic free-offer sync job', async () => {
    const queue = {
      add: jest.fn().mockResolvedValue({ id: 'repeat-job-1' }),
    };
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    };
    const service = new EpicFreeOffersSchedulerService(
      queue as never,
      config as never,
    );

    await service.registerWeeklySync();

    expect(queue.add).toHaveBeenCalledWith(
      EPIC_FREE_OFFERS_SYNC_JOB,
      {},
      {
        jobId: EPIC_FREE_OFFERS_SYNC_SCHEDULER_ID,
        repeat: {
          pattern: EPIC_FREE_OFFERS_SYNC_CRON,
          tz: EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
        },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60_000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );
  });

  it('does not register scheduled jobs in tests unless explicitly enabled', async () => {
    const queue = {
      add: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string) => (key === 'NODE_ENV' ? 'test' : undefined)),
    };
    const service = new EpicFreeOffersSchedulerService(
      queue as never,
      config as never,
    );

    await service.onModuleInit();

    expect(queue.add).not.toHaveBeenCalled();
  });

  it('uses scheduler environment overrides', async () => {
    const queue = {
      add: jest.fn().mockResolvedValue({ id: 'repeat-job-1' }),
    };
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'EPIC_FREE_OFFERS_SYNC_CRON') {
          return '5 19 * * 4';
        }
        if (key === 'EPIC_FREE_OFFERS_SYNC_TIMEZONE') {
          return 'UTC';
        }

        return undefined;
      }),
    };
    const service = new EpicFreeOffersSchedulerService(
      queue as never,
      config as never,
    );

    await service.registerWeeklySync();

    expect(queue.add).toHaveBeenCalledWith(
      EPIC_FREE_OFFERS_SYNC_JOB,
      {},
      expect.objectContaining({
        repeat: {
          pattern: '5 19 * * 4',
          tz: 'UTC',
        },
      }),
    );
  });
});
