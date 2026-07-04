import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalApiKeyGuard } from './internal-api-key.guard.js';

describe('InternalApiKeyGuard', () => {
  it('allows requests with a matching key', () => {
    const guard = new InternalApiKeyGuard({
      get: () => 'expected-key',
    } as unknown as ConfigService);

    expect(guard.canActivate(createContext('expected-key'))).toBe(true);
  });

  it('rejects requests when the configured key is missing', () => {
    const guard = new InternalApiKeyGuard({
      get: () => undefined,
    } as unknown as ConfigService);

    expect(() => guard.canActivate(createContext('expected-key'))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects requests with an invalid key', () => {
    const guard = new InternalApiKeyGuard({
      get: () => 'expected-key',
    } as unknown as ConfigService);

    expect(() => guard.canActivate(createContext('wrong-key'))).toThrow(
      UnauthorizedException,
    );
  });
});

function createContext(apiKey: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) => (name === 'x-api-key' ? apiKey : undefined),
      }),
    }),
  } as never;
}
