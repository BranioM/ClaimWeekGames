import { Injectable } from '@nestjs/common';
import { EpicGamesOffer } from './epic-games.types.js';

const EPIC_CLIENT_ID = '875a3b57d3a640a6b7f9b4e883463ab4';
const EPIC_LOGIN_ENDPOINT = 'https://www.epicgames.com/id/login';
const EPIC_PURCHASE_ENDPOINT = 'https://www.epicgames.com/store/purchase';

@Injectable()
export class EpicGamesCheckoutService {
  generateCheckoutUrl(offers: EpicGamesOffer[]): string | undefined {
    const purchasableOffers = offers.filter(
      (offer) => offer.providerNamespace && offer.providerGameId,
    );

    if (!purchasableOffers.length) {
      return undefined;
    }

    const purchaseUrl = new URL(EPIC_PURCHASE_ENDPOINT);
    purchaseUrl.searchParams.set('highlightColor', '0078f2');
    purchaseUrl.searchParams.set('orderId', '');
    purchaseUrl.searchParams.set('purchaseToken', '');
    purchaseUrl.searchParams.set('showNavigation', 'true');

    for (const offer of purchasableOffers) {
      purchaseUrl.searchParams.append(
        'offers',
        `1-${offer.providerNamespace}-${offer.providerGameId}`,
      );
    }

    const loginUrl = new URL(EPIC_LOGIN_ENDPOINT);
    loginUrl.searchParams.set('noHostRedirect', 'true');
    loginUrl.searchParams.set('redirectUrl', purchaseUrl.toString());
    loginUrl.searchParams.set('client_id', EPIC_CLIENT_ID);

    return loginUrl.toString();
  }
}
