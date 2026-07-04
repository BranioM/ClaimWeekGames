import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';

describe('EpicGamesCheckoutService', () => {
  it('generates a user-assisted Epic checkout URL', () => {
    const service = new EpicGamesCheckoutService();
    const checkoutUrl = service.generateCheckoutUrl([
      {
        providerGameId: 'offer-1',
        providerNamespace: 'namespace-1',
        title: 'Example Game',
        slug: 'example-game',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-07-08T00:00:00.000Z'),
      },
    ]);

    expect(checkoutUrl).toBeDefined();

    const loginUrl = new URL(checkoutUrl ?? '');
    const purchaseUrl = new URL(loginUrl.searchParams.get('redirectUrl') ?? '');

    expect(loginUrl.origin).toBe('https://www.epicgames.com');
    expect(loginUrl.pathname).toBe('/id/login');
    expect(purchaseUrl.origin).toBe('https://www.epicgames.com');
    expect(purchaseUrl.pathname).toBe('/store/purchase');
    expect(purchaseUrl.searchParams.getAll('offers')).toEqual([
      '1-namespace-1-offer-1',
    ]);
  });

  it('does not generate checkout links for offers without namespaces', () => {
    const service = new EpicGamesCheckoutService();

    expect(
      service.generateCheckoutUrl([
        {
          providerGameId: 'offer-1',
          title: 'Example Game',
          slug: 'example-game',
          startDate: new Date('2026-07-01T00:00:00.000Z'),
          endDate: new Date('2026-07-08T00:00:00.000Z'),
        },
      ]),
    ).toBeUndefined();
  });
});
