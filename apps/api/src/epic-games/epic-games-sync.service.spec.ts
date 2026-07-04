import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesSyncService } from './epic-games-sync.service.js';

describe('EpicGamesSyncService', () => {
  it('persists normalized free-game offers', async () => {
    const prisma = {
      platform: {
        upsert: jest.fn().mockResolvedValue({ id: 'platform-1' }),
      },
      game: {
        upsert: jest.fn().mockResolvedValue({ id: 'game-1' }),
      },
      externalGameId: {
        upsert: jest.fn().mockResolvedValue({ id: 'external-game-1' }),
      },
      freeGameOffer: {
        upsert: jest.fn().mockResolvedValue({ id: 'offer-1' }),
      },
    };
    const client = {
      getFreeGameOffers: jest.fn().mockResolvedValue([
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
      ]),
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
      platformId: 'platform-1',
      offersSeen: 1,
      offersSynced: 1,
      checkoutUrl: 'https://example.com',
    });
    expect(checkout.generateCheckoutUrl).toHaveBeenCalledWith(
      await client.getFreeGameOffers(),
    );
    expect(prisma.externalGameId.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          platformId_providerGameId: {
            platformId: 'platform-1',
            providerGameId: 'epic-game-1',
          },
        },
      }),
    );
    expect(prisma.freeGameOffer.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          platformId_externalOfferId: {
            platformId: 'platform-1',
            externalOfferId:
              'epic-game-1:2026-07-01T00:00:00.000Z:2026-07-08T00:00:00.000Z',
          },
        },
      }),
    );
  });
});
