import { ConfigService } from '@nestjs/config';
import { EpicGamesClientService } from './epic-games-client.service.js';

describe('EpicGamesClientService', () => {
  it('rejects non-Epic configured endpoints', async () => {
    const service = new EpicGamesClientService({
      get: () => 'http://169.254.169.254/latest/meta-data',
    } as unknown as ConfigService);

    await expect(service.getFreeGameOffers()).rejects.toThrow(
      'Invalid Epic Games endpoint host',
    );
  });

  it('parses current and upcoming promotional windows', () => {
    const service = new EpicGamesClientService({
      get: () => undefined,
    } as unknown as ConfigService);

    expect(
      service.parseFreeGameOffers({
        data: {
          Catalog: {
            searchStore: {
              elements: [
                {
                  id: 'game-1',
                  namespace: 'namespace-1',
                  title: 'Example Game',
                  productSlug: 'example-game',
                  seller: { name: 'Example Publisher' },
                  customAttributes: [
                    { key: 'developerName', value: 'Example Dev' },
                  ],
                  promotions: {
                    promotionalOffers: [
                      {
                        promotionalOffers: [
                          {
                            startDate: '2026-07-01T00:00:00.000Z',
                            endDate: '2026-07-08T00:00:00.000Z',
                            discountSetting: {
                              discountPercentage: 0,
                            },
                          },
                        ],
                      },
                    ],
                    upcomingPromotionalOffers: [],
                  },
                },
              ],
            },
          },
        },
      }),
    ).toEqual([
      {
        providerGameId: 'game-1',
        providerNamespace: 'namespace-1',
        title: 'Example Game',
        slug: 'example-game',
        developer: 'Example Dev',
        publisher: 'Example Publisher',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-07-08T00:00:00.000Z'),
      },
    ]);
  });
});
