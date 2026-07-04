import { jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { EpicSyncController } from './epic-sync.controller.js';

describe('EpicSyncController', () => {
  it('syncs free offers through the service', async () => {
    const freeOfferSync = {
      syncFreeGames: jest.fn().mockResolvedValue({ offersSynced: 1 }),
    };
    const ownershipSync = {
      syncOwnedGames: jest.fn(),
    };
    const controller = new EpicSyncController(
      freeOfferSync as never,
      ownershipSync as never,
    );

    await expect(controller.syncFreeOffers()).resolves.toEqual({
      offersSynced: 1,
    });
  });

  it('validates and syncs ownership payloads', async () => {
    const freeOfferSync = {
      syncFreeGames: jest.fn(),
    };
    const ownershipSync = {
      syncOwnedGames: jest.fn().mockResolvedValue({ ownershipsSynced: 1 }),
    };
    const controller = new EpicSyncController(
      freeOfferSync as never,
      ownershipSync as never,
    );

    await expect(
      controller.syncOwnerships({
        connectedAccountId: 'account-1',
        ownedGames: [
          {
            providerGameId: 'game-1',
            title: 'Example Game',
            acquiredAt: '2026-07-04T00:00:00.000Z',
          },
        ],
      }),
    ).resolves.toEqual({ ownershipsSynced: 1 });
    expect(ownershipSync.syncOwnedGames).toHaveBeenCalledWith('account-1', [
      {
        providerGameId: 'game-1',
        title: 'Example Game',
        slug: undefined,
        developer: undefined,
        publisher: undefined,
        acquiredAt: new Date('2026-07-04T00:00:00.000Z'),
      },
    ]);
  });

  it('rejects invalid ownership payloads', () => {
    const controller = new EpicSyncController({} as never, {} as never);

    expect(() => controller.syncOwnerships({ ownedGames: [] })).toThrow(
      BadRequestException,
    );
  });
});
