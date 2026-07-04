import { jest } from '@jest/globals';
import { AuthenticatedUserGuard } from './authenticated-user.guard.js';

describe('AuthenticatedUserGuard', () => {
  it('attaches the authenticated user to the request', async () => {
    const authService = {
      authenticateBearerToken: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      }),
    };
    const guard = new AuthenticatedUserGuard(authService as never);
    const request = createRequest('Bearer token-value');

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(authService.authenticateBearerToken).toHaveBeenCalledWith(
      'token-value',
    );
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
  });

  it('passes undefined to the auth service when the bearer header is missing', async () => {
    const authService = {
      authenticateBearerToken: jest.fn().mockRejectedValue(new Error('denied')),
    };
    const guard = new AuthenticatedUserGuard(authService as never);

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toThrow('denied');
    expect(authService.authenticateBearerToken).toHaveBeenCalledWith(undefined);
  });
});

function createRequest(authorization?: string) {
  return {
    header: (name: string) =>
      name.toLowerCase() === 'authorization' ? authorization : undefined,
  } as never;
}

function createContext(request: never) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as never;
}
