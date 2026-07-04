import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesOffer, EpicGamesSyncResult } from './epic-games.types.js';

@Injectable()
export class EpicGamesSyncService {
  private readonly logger = new Logger(EpicGamesSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly epicGamesClient: EpicGamesClientService,
    private readonly epicGamesCheckout: EpicGamesCheckoutService,
  ) {}

  async syncFreeGames(): Promise<EpicGamesSyncResult> {
    const offers = await this.epicGamesClient.getFreeGameOffers();
    const store = await this.prisma.store.upsert({
      where: { name: 'Epic Games Store' },
      create: { name: 'Epic Games Store' },
      update: {},
    });
    let offersSynced = 0;

    for (const offer of offers) {
      await this.upsertOffer(store.id, offer);
      offersSynced += 1;
    }

    this.logger.log(`Synced ${offersSynced} Epic Games free-game offers`);

    return {
      storeId: store.id,
      offersSeen: offers.length,
      offersSynced,
      checkoutUrl: this.epicGamesCheckout.generateCheckoutUrl(offers),
      syncedAt: new Date().toISOString(),
    };
  }

  private async upsertOffer(storeId: string, offer: EpicGamesOffer) {
    const game = await this.prisma.game.upsert({
      where: { slug: offer.slug },
      create: {
        title: offer.title,
        slug: offer.slug,
        developer: offer.developer,
        publisher: offer.publisher,
      },
      update: {
        title: offer.title,
        developer: offer.developer,
        publisher: offer.publisher,
      },
    });

    await this.prisma.externalGameId.upsert({
      where: {
        storeId_providerGameId: {
          storeId,
          providerGameId: offer.providerGameId,
        },
      },
      create: {
        storeId,
        gameId: game.id,
        providerGameId: offer.providerGameId,
      },
      update: {
        gameId: game.id,
      },
    });

    const externalOfferId = [
      offer.providerGameId,
      offer.startDate.toISOString(),
      offer.endDate.toISOString(),
    ].join(':');

    await this.prisma.freeGameOffer.upsert({
      where: {
        storeId_externalOfferId: {
          storeId,
          externalOfferId,
        },
      },
      create: {
        externalOfferId,
        storeId,
        gameId: game.id,
        startDate: offer.startDate,
        endDate: offer.endDate,
      },
      update: {
        gameId: game.id,
        startDate: offer.startDate,
        endDate: offer.endDate,
      },
    });
  }
}
