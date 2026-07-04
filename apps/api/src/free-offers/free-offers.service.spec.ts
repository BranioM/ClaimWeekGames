import { jest } from '@jest/globals';
import { FreeOffersService } from './free-offers.service.js';

describe('FreeOffersService', () => {
  it('returns active offers as API-safe views', async () => {
    const prisma = {
      freeGameOffer: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'offer-1',
            externalOfferId: null,
            startDate: new Date('2026-07-01T00:00:00.000Z'),
            endDate: new Date('2026-07-08T00:00:00.000Z'),
            detectedAt: new Date('2026-07-04T00:00:00.000Z'),
            game: {
              id: 'game-1',
              title: 'Example Game',
              slug: 'example-game',
              developer: null,
              publisher: 'Example Publisher',
            },
            store: {
              id: 'store-1',
              name: 'Epic Games Store',
            },
          },
        ]),
      },
    };
    const service = new FreeOffersService(prisma as never);

    await expect(
      service.listActiveOffers(new Date('2026-07-04T00:00:00.000Z')),
    ).resolves.toEqual([
      {
        id: 'offer-1',
        externalOfferId: undefined,
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2026-07-08T00:00:00.000Z',
        detectedAt: '2026-07-04T00:00:00.000Z',
        game: {
          id: 'game-1',
          title: 'Example Game',
          slug: 'example-game',
          developer: undefined,
          publisher: 'Example Publisher',
        },
        store: {
          id: 'store-1',
          name: 'Epic Games Store',
        },
      },
    ]);
  });
});
