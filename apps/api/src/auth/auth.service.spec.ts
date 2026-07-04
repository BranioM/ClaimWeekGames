import { UnauthorizedException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('creates a session token and persists only its hash', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
        }),
      },
      userSession: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new AuthService(prisma as never);

    const session = await service.createSessionForUser('user-1');

    expect(session.token).toEqual(expect.any(String));
    expect(session.token.length).toBeGreaterThan(20);
    expect(session.user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
    const createMock = prisma.userSession.create as jest.MockedFunction<
      (input: {
        data: {
          userId: string;
          tokenHash: string;
          expiresAt: Date;
        };
      }) => Promise<unknown>
    >;
    const createInput = createMock.mock.calls[0]?.[0];

    expect(createInput).toBeDefined();
    expect(createInput?.data.userId).toBe('user-1');
    expect(typeof createInput?.data.tokenHash).toBe('string');
    expect(createInput?.data.tokenHash).not.toBe(session.token);
    expect(createInput?.data.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects session creation for a missing user', async () => {
    const service = new AuthService({
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as never);

    await expect(service.createSessionForUser('missing-user')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('authenticates a valid bearer token', async () => {
    const prisma = {
      userSession: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'session-1',
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new AuthService(prisma as never);

    await expect(service.authenticateBearerToken('token')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
    const findUniqueMock = prisma.userSession.findUnique as jest.MockedFunction<
      (input: {
        where: { tokenHash: string };
        select: {
          id: true;
          expiresAt: true;
          revokedAt: true;
          user: {
            select: {
              id: true;
              email: true;
            };
          };
        };
      }) => Promise<unknown>
    >;
    const findUniqueInput = findUniqueMock.mock.calls[0]?.[0];

    expect(findUniqueInput).toBeDefined();
    expect(typeof findUniqueInput?.where.tokenHash).toBe('string');
    expect(findUniqueInput?.select).toEqual({
      id: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    });
    expect(prisma.userSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: {
        lastUsedAt: expect.any(Date) as Date,
      },
    });
  });

  it('rejects missing, revoked, expired, or unknown tokens', async () => {
    const service = new AuthService({
      userSession: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as never);

    await expect(service.authenticateBearerToken(undefined)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(service.authenticateBearerToken('unknown')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
