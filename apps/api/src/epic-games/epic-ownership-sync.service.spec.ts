import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { EpicOwnershipSyncService } from './epic-ownership-sync.service.js';

type TransactionClient = {
  game: {
    upsert: jest.Mock;
  };
  externalGameId: {
    upsert: jest.Mock;
  };
  ownership: {
    upsert: jest.Mock;
  };
  connectedAccount: {
    update: jest.Mock;
  };
};

describe('EpicOwnershipSyncService', () => {
  it('requires an active Epic connected account', async () => {
    const prisma = {
      connectedAccount: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'account-1',
          status: 'DISCONNECTED',
          store: { name: 'Epic Games Store' },
        }),
      },
    };
    const service = new EpicOwnershipSyncService(prisma as never);

    await expect(
      service.syncOwnedGames('account-1', []),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upserts games, external IDs, ownerships, and last sync time', async () => {
    const tx: TransactionClient = {
      game: {
        upsert: jest.fn().mockResolvedValue({ id: 'game-1' }),
      },
      externalGameId: {
        upsert: jest.fn().mockResolvedValue({ id: 'external-1' }),
      },
      ownership: {
        upsert: jest.fn().mockResolvedValue({ id: 'ownership-1' }),
      },
      connectedAccount: {
        update: jest.fn().mockResolvedValue({ id: 'account-1' }),
      },
    };
    const prisma = {
      connectedAccount: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'account-1',
          storeId: 'store-1',
          status: 'ACTIVE',
          store: { name: 'Epic Games Store' },
        }),
      },
      $transaction: jest.fn(
        (
          callback: (transactionClient: TransactionClient) => Promise<unknown>,
        ) => callback(tx),
      ),
    };
    const service = new EpicOwnershipSyncService(prisma as never);

    await expect(
      service.syncOwnedGames('account-1', [
        {
          providerGameId: 'epic-game-1',
          title: 'Example Game',
          developer: 'Example Dev',
          publisher: 'Example Publisher',
          acquiredAt: new Date('2026-07-04T00:00:00.000Z'),
        },
      ]),
    ).resolves.toMatchObject({
      connectedAccountId: 'account-1',
      gamesSeen: 1,
      ownershipsSynced: 1,
    });
    expect(tx.game.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'example-game' },
      }),
    );
    expect(tx.externalGameId.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          storeId_providerGameId: {
            storeId: 'store-1',
            providerGameId: 'epic-game-1',
          },
        },
      }),
    );
    expect(tx.ownership.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          connectedAccountId_gameId: {
            connectedAccountId: 'account-1',
            gameId: 'game-1',
          },
        },
      }),
    );
    expect(tx.connectedAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'account-1' },
        data: { lastSyncedAt: expect.any(Date) as Date },
      }),
    );
  });
});
