import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesOffer, EpicGamesSyncResult } from './epic-games.types.js';

@Injectable()
export class EpicGamesSyncService {
  private readonly logger = new Logger(EpicGamesSyncService.name);
  private readonly epicStoreName = 'Epic Games Store';
  private readonly weeklyFreeOffersJobType = 'EPIC_WEEKLY_FREE_OFFERS';

  constructor(
    private readonly prisma: PrismaService,
    private readonly epicGamesClient: EpicGamesClientService,
    private readonly epicGamesCheckout: EpicGamesCheckoutService,
  ) {}

  async syncFreeGames(): Promise<EpicGamesSyncResult> {
    const store = await this.prisma.store.upsert({
      where: { name: this.epicStoreName },
      create: { name: this.epicStoreName },
      update: {},
    });
    const syncJob = await this.prisma.syncJob.create({
      data: {
        jobType: this.weeklyFreeOffersJobType,
        status: 'RUNNING',
        storeId: store.id,
        startedAt: new Date(),
      },
    });

    try {
      const offers = await this.epicGamesClient.getFreeGameOffers();
      const counters = {
        offersSynced: 0,
        gamesCreated: 0,
        externalIdsCreated: 0,
        offersCreated: 0,
        offersUpdated: 0,
      };

      for (const offer of offers) {
        const result = await this.upsertOffer(store.id, offer);
        counters.offersSynced += 1;
        counters.gamesCreated += result.gameCreated ? 1 : 0;
        counters.externalIdsCreated += result.externalIdCreated ? 1 : 0;
        counters.offersCreated += result.offerCreated ? 1 : 0;
        counters.offersUpdated += result.offerUpdated ? 1 : 0;
      }

      const checkoutUrl = this.epicGamesCheckout.generateCheckoutUrl(offers);
      const syncedAt = new Date();

      await this.prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'SUCCEEDED',
          finishedAt: syncedAt,
          metadata: {
            offersSeen: offers.length,
            offersSynced: counters.offersSynced,
            gamesCreated: counters.gamesCreated,
            externalIdsCreated: counters.externalIdsCreated,
            offersCreated: counters.offersCreated,
            offersUpdated: counters.offersUpdated,
            checkoutUrl,
          },
        },
      });

      this.logger.log(
        `Synced ${counters.offersSynced} Epic Games free-game offers`,
      );

      return {
        syncJobId: syncJob.id,
        storeId: store.id,
        offersSeen: offers.length,
        offersSynced: counters.offersSynced,
        gamesCreated: counters.gamesCreated,
        externalIdsCreated: counters.externalIdsCreated,
        offersCreated: counters.offersCreated,
        offersUpdated: counters.offersUpdated,
        checkoutUrl,
        syncedAt: syncedAt.toISOString(),
      };
    } catch (error) {
      await this.prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          error: getErrorMessage(error),
        },
      });

      throw error;
    }
  }

  private async upsertOffer(storeId: string, offer: EpicGamesOffer) {
    const existingGame = await this.prisma.game.findUnique({
      where: { slug: offer.slug },
      select: { id: true },
    });
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

    const existingExternalId = await this.prisma.externalGameId.findUnique({
      where: {
        storeId_providerGameId: {
          storeId,
          providerGameId: offer.providerGameId,
        },
      },
      select: { id: true },
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

    const existingOffer = await this.prisma.freeGameOffer.findUnique({
      where: {
        storeId_externalOfferId: {
          storeId,
          externalOfferId,
        },
      },
      select: { id: true },
    });
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

    return {
      gameCreated: !existingGame,
      externalIdCreated: !existingExternalId,
      offerCreated: !existingOffer,
      offerUpdated: Boolean(existingOffer),
    };
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Epic sync failure';
}
