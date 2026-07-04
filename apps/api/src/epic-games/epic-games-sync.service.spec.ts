import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesSyncService } from './epic-games-sync.service.js';

describe('EpicGamesSyncService', () => {
  it('persists normalized free-game offers', async () => {
    const prisma = {
      store: {
        upsert: jest.fn().mockResolvedValue({ id: 'store-1' }),
      },
      game: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: 'game-1' }),
      },
      externalGameId: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: 'external-game-1' }),
      },
      freeGameOffer: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: 'offer-1' }),
      },
      syncJob: {
        create: jest.fn().mockResolvedValue({ id: 'sync-job-1' }),
        update: jest.fn().mockResolvedValue({ id: 'sync-job-1' }),
      },
    };
    const offers = [
      {
        providerGameId: 'epic-game-1',
        providerNamespace: 'namespace-1',
        title: 'Example Game',
        slug: 'example-game',
        developer: 'Example Dev',
        publisher: 'Example Publisher',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-07-08T00:00:00.000Z'),
      },
    ];
    const client = {
      getFreeGameOffers: jest.fn().mockResolvedValue(offers),
    };
    const checkout = {
      generateCheckoutUrl: jest.fn().mockReturnValue('https://example.com'),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpicGamesSyncService,
        { provide: PrismaService, useValue: prisma },
        { provide: EpicGamesClientService, useValue: client },
        { provide: EpicGamesCheckoutService, useValue: checkout },
      ],
    }).compile();

    const service = module.get(EpicGamesSyncService);

    await expect(service.syncFreeGames()).resolves.toMatchObject({
      syncJobId: 'sync-job-1',
      storeId: 'store-1',
      source: 'manual',
      offersSeen: 1,
      offersSynced: 1,
      gamesCreated: 1,
      gamesUpdated: 0,
      externalIdsCreated: 1,
      externalIdsUpdated: 0,
      offersCreated: 1,
      offersUpdated: 0,
      checkoutUrl: 'https://example.com',
      durationMs: expect.any(Number) as number,
    });
    expect(prisma.syncJob.create).toHaveBeenCalledWith({
      data: {
        jobType: 'EPIC_WEEKLY_FREE_OFFERS',
        status: 'PENDING',
        storeId: 'store-1',
        metadata: {
          source: 'manual',
        },
      },
    });
    expect(prisma.syncJob.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'sync-job-1' },
      data: {
        status: 'RUNNING',
        startedAt: expect.any(Date) as Date,
        metadata: {
          source: 'manual',
          startedAt: expect.any(String) as string,
        },
      },
    });
    expect(checkout.generateCheckoutUrl).toHaveBeenCalledWith(offers);
    expect(prisma.syncJob.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'sync-job-1' },
      data: {
        status: 'SUCCEEDED',
        finishedAt: expect.any(Date) as Date,
        metadata: {
          source: 'manual',
          offersSeen: 1,
          offersSynced: 1,
          gamesCreated: 1,
          gamesUpdated: 0,
          externalIdsCreated: 1,
          externalIdsUpdated: 0,
          offersCreated: 1,
          offersUpdated: 0,
          startedAt: expect.any(String) as string,
          finishedAt: expect.any(String) as string,
          durationMs: expect.any(Number) as number,
          checkoutUrl: 'https://example.com',
        },
      },
    });
    expect(prisma.externalGameId.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          storeId_providerGameId: {
            storeId: 'store-1',
            providerGameId: 'epic-game-1',
          },
        },
      }),
    );
    expect(prisma.freeGameOffer.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          storeId_externalOfferId: {
            storeId: 'store-1',
            externalOfferId:
              'epic-game-1:2026-07-01T00:00:00.000Z:2026-07-08T00:00:00.000Z',
          },
        },
      }),
    );
  });

  it('counts duplicate offer sync as idempotent updates', async () => {
    const prisma = {
      store: {
        upsert: jest.fn().mockResolvedValue({ id: 'store-1' }),
      },
      game: {
        findUnique: jest.fn().mockResolvedValue({ id: 'game-1' }),
        upsert: jest.fn().mockResolvedValue({ id: 'game-1' }),
      },
      externalGameId: {
        findUnique: jest.fn().mockResolvedValue({ id: 'external-game-1' }),
        upsert: jest.fn().mockResolvedValue({ id: 'external-game-1' }),
      },
      freeGameOffer: {
        findUnique: jest.fn().mockResolvedValue({ id: 'offer-1' }),
        upsert: jest.fn().mockResolvedValue({ id: 'offer-1' }),
      },
      syncJob: {
        create: jest.fn().mockResolvedValue({ id: 'sync-job-1' }),
        update: jest.fn().mockResolvedValue({ id: 'sync-job-1' }),
      },
    };
    const offers = [
      {
        providerGameId: 'epic-game-1',
        providerNamespace: 'namespace-1',
        title: 'Example Game',
        slug: 'example-game',
        developer: 'Example Dev',
        publisher: 'Example Publisher',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-07-08T00:00:00.000Z'),
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpicGamesSyncService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EpicGamesClientService,
          useValue: { getFreeGameOffers: jest.fn().mockResolvedValue(offers) },
        },
        {
          provide: EpicGamesCheckoutService,
          useValue: { generateCheckoutUrl: jest.fn() },
        },
      ],
    }).compile();

    const service = module.get(EpicGamesSyncService);

    await expect(service.syncFreeGames()).resolves.toMatchObject({
      gamesCreated: 0,
      gamesUpdated: 1,
      externalIdsCreated: 0,
      externalIdsUpdated: 1,
      offersCreated: 0,
      offersUpdated: 1,
    });
    expect(prisma.syncJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'SUCCEEDED',
          metadata: expect.objectContaining({
            gamesCreated: 0,
            gamesUpdated: 1,
            externalIdsCreated: 0,
            externalIdsUpdated: 1,
            offersCreated: 0,
            offersUpdated: 1,
          }) as unknown,
        }) as unknown,
      }),
    );
  });

  it('marks the sync job failed when Epic fetch fails', async () => {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpicGamesSyncService,
        { provide: PrismaService, useValue: prisma },
        { provide: EpicGamesClientService, useValue: client },
        { provide: EpicGamesCheckoutService, useValue: checkout },
      ],
    }).compile();

    const service = module.get(EpicGamesSyncService);

    await expect(service.syncFreeGames()).rejects.toThrow('Epic unavailable');
    expect(prisma.syncJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sync-job-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          finishedAt: expect.any(Date) as Date,
          error: 'Epic unavailable',
          metadata: expect.objectContaining({
            source: 'manual',
            startedAt: expect.any(String) as string,
            finishedAt: expect.any(String) as string,
            durationMs: expect.any(Number) as number,
          }) as unknown,
        }) as unknown,
      }),
    );
  });
});
