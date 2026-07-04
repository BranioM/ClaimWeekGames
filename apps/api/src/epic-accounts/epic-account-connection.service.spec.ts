import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { EpicAccountConnectionService } from './epic-account-connection.service.js';

type CreateConnectionStateCall = {
  data: {
    userId: string;
    platformId: string;
    stateHash: string;
    state?: string;
  };
};

type TransactionClient = {
  accountConnectionState: {
    update: jest.Mock;
  };
  connectedAccount: {
    upsert: jest.Mock;
  };
};

describe('EpicAccountConnectionService', () => {
  const platform = { id: 'platform-1' };

  it('stores only a hashed one-time connection state', async () => {
    const prisma = {
      platform: {
        upsert: jest.fn().mockResolvedValue(platform),
      },
      accountConnectionState: {
        create: jest.fn().mockResolvedValue({ id: 'state-1' }),
      },
    };
    const service = new EpicAccountConnectionService(prisma as never);

    const result = await service.createConnectionState('user-1');

    expect(result.state).toHaveLength(43);
    const createCall = prisma.accountConnectionState.create.mock
      .calls[0]?.[0] as CreateConnectionStateCall | undefined;

    expect(createCall?.data.userId).toBe('user-1');
    expect(createCall?.data.platformId).toBe('platform-1');
    expect(createCall?.data.stateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createCall?.data).not.toHaveProperty('state');
  });

  it('rejects invalid connection states', async () => {
    const prisma = {
      platform: {
        upsert: jest.fn().mockResolvedValue(platform),
      },
      accountConnectionState: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new EpicAccountConnectionService(prisma as never);

    await expect(
      service.connectAccount({
        userId: 'user-1',
        state: 'invalid',
        externalAccountId: 'epic-user-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('consumes state and upserts the connected account', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const tx: TransactionClient = {
      accountConnectionState: {
        update: jest.fn().mockResolvedValue({ id: 'state-1' }),
      },
      connectedAccount: {
        upsert: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          platformId: 'platform-1',
          externalAccountId: 'epic-user-1',
          displayName: 'Epic User',
        }),
      },
    };
    const prisma = {
      platform: {
        upsert: jest.fn().mockResolvedValue(platform),
      },
      accountConnectionState: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'state-1',
          userId: 'user-1',
          platformId: 'platform-1',
          consumedAt: null,
          expiresAt,
        }),
      },
      $transaction: jest.fn(
        (
          callback: (transactionClient: TransactionClient) => Promise<unknown>,
        ) => callback(tx),
      ),
    };
    const service = new EpicAccountConnectionService(prisma as never);

    await expect(
      service.connectAccount({
        userId: 'user-1',
        state: 'valid-state',
        externalAccountId: 'epic-user-1',
        displayName: 'Epic User',
      }),
    ).resolves.toEqual({
      id: 'account-1',
      userId: 'user-1',
      platformId: 'platform-1',
      externalAccountId: 'epic-user-1',
      displayName: 'Epic User',
    });
  });
});
