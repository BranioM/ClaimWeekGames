import { jest } from '@jest/globals';
import { CronJob } from 'cron';
import { EpicFreeOffersSchedulerService } from './epic-free-offers-scheduler.service.js';
import {
  EPIC_FREE_OFFERS_SYNC_CRON,
  EPIC_FREE_OFFERS_SYNC_JOB_NAME,
  EPIC_FREE_OFFERS_SYNC_TIME_ZONE,
} from './scheduler.constants.js';

describe('EpicFreeOffersSchedulerService', () => {
  it('registers the weekly Epic free-offer sync job', async () => {
    const addedJobs: CronJob[] = [];
    const schedulerRegistry = {
      doesExist: jest.fn().mockReturnValue(false),
      deleteCronJob: jest.fn(),
      addCronJob: jest.fn((_name: string, job: CronJob) => {
        addedJobs.push(job);
      }),
    };
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    };
    const epicGamesSync = {
      syncFreeGames: jest.fn(),
    };
    const service = new EpicFreeOffersSchedulerService(
      schedulerRegistry as never,
      config as never,
      epicGamesSync as never,
    );

    service.registerWeeklySync();

    expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
      EPIC_FREE_OFFERS_SYNC_JOB_NAME,
      expect.any(CronJob),
    );

    const job = addedJobs[0];
    if (!job) {
      throw new Error('Cron job was not registered');
    }
    expect(job.name).toBe(EPIC_FREE_OFFERS_SYNC_JOB_NAME);
    expect(job.cronTime.source).toBe(EPIC_FREE_OFFERS_SYNC_CRON);
    expect(job.cronTime.timeZone).toBe(EPIC_FREE_OFFERS_SYNC_TIME_ZONE);
    await job.stop();
  });

  it('does not register scheduled jobs in tests unless explicitly enabled', () => {
    const schedulerRegistry = {
      addCronJob: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string) => (key === 'NODE_ENV' ? 'test' : undefined)),
    };
    const service = new EpicFreeOffersSchedulerService(
      schedulerRegistry as never,
      config as never,
      { syncFreeGames: jest.fn() } as never,
    );

    service.onModuleInit();

    expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
  });

  it('uses scheduler environment overrides', async () => {
    const addedJobs: CronJob[] = [];
    const schedulerRegistry = {
      doesExist: jest.fn().mockReturnValue(false),
      deleteCronJob: jest.fn(),
      addCronJob: jest.fn((_name: string, job: CronJob) => {
        addedJobs.push(job);
      }),
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
      schedulerRegistry as never,
      config as never,
      { syncFreeGames: jest.fn() } as never,
    );

    service.registerWeeklySync();

    const job = addedJobs[0];
    if (!job) {
      throw new Error('Cron job was not registered');
    }
    expect(job.cronTime.source).toBe('5 19 * * 4');
    expect(job.cronTime.timeZone).toBe('UTC');
    await job.stop();
  });

  it('runs scheduled sync with scheduled source', async () => {
    const epicGamesSync = {
      syncFreeGames: jest.fn().mockResolvedValue({ syncJobId: 'sync-job-1' }),
    };
    const service = new EpicFreeOffersSchedulerService(
      {} as never,
      { get: jest.fn() } as never,
      epicGamesSync as never,
    );

    await service.runScheduledSync();

    expect(epicGamesSync.syncFreeGames).toHaveBeenCalledWith('scheduled');
  });
});
