import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { EpicAccountsController } from './epic-accounts.controller.js';

describe('EpicAccountsController', () => {
  it('creates a connection state through the service', async () => {
    const service = {
      createConnectionState: jest.fn().mockResolvedValue({
        state: 'state-value',
        expiresAt: new Date('2026-07-04T00:10:00.000Z'),
      }),
      connectAccount: jest.fn(),
    };
    const controller = new EpicAccountsController(service as never);

    await expect(
      controller.createConnectionState({ userId: 'user-1' }),
    ).resolves.toEqual({
      state: 'state-value',
      expiresAt: new Date('2026-07-04T00:10:00.000Z'),
    });
    expect(service.createConnectionState).toHaveBeenCalledWith('user-1');
  });

  it('connects an Epic account through the service', async () => {
    const service = {
      createConnectionState: jest.fn(),
      connectAccount: jest.fn().mockResolvedValue({
        id: 'account-1',
        userId: 'user-1',
        storeId: 'store-1',
        externalAccountId: 'epic-user-1',
        displayName: 'Epic User',
      }),
    };
    const controller = new EpicAccountsController(service as never);

    await expect(
      controller.connectAccount({
        userId: 'user-1',
        state: 'state-value',
        externalAccountId: 'epic-user-1',
        displayName: 'Epic User',
      }),
    ).resolves.toEqual({
      id: 'account-1',
      userId: 'user-1',
      storeId: 'store-1',
      externalAccountId: 'epic-user-1',
      displayName: 'Epic User',
    });
    expect(service.connectAccount).toHaveBeenCalledWith({
      userId: 'user-1',
      state: 'state-value',
      externalAccountId: 'epic-user-1',
      displayName: 'Epic User',
    });
  });

  it('rejects invalid connection state requests', () => {
    const controller = new EpicAccountsController({} as never);

    expect(() => controller.createConnectionState({})).toThrow(
      BadRequestException,
    );
  });

  it('rejects invalid connect requests', () => {
    const controller = new EpicAccountsController({} as never);

    expect(() => controller.connectAccount({ userId: 'user-1' })).toThrow(
      BadRequestException,
    );
  });
});
