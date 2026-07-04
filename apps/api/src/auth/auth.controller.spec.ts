import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  it('returns the current user', () => {
    const controller = new AuthController({} as never);

    expect(
      controller.getCurrentUser({
        id: 'user-1',
        email: 'user@example.com',
      }),
    ).toEqual({
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    });
  });

  it('creates an internal bootstrap session', async () => {
    const authService = {
      createSessionForUser: jest.fn().mockResolvedValue({
        token: 'session-token',
        expiresAt: new Date('2026-08-03T00:00:00.000Z'),
        user: {
          id: 'user-1',
          email: 'user@example.com',
        },
      }),
    };
    const controller = new AuthController(authService as never);

    await expect(
      controller.createSession({ userId: 'user-1' }),
    ).resolves.toEqual({
      token: 'session-token',
      expiresAt: new Date('2026-08-03T00:00:00.000Z'),
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    });
    expect(authService.createSessionForUser).toHaveBeenCalledWith('user-1');
  });

  it('rejects invalid session requests', () => {
    const controller = new AuthController({} as never);

    expect(() => controller.createSession({})).toThrow(BadRequestException);
  });
});
