import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type FreeOfferView = {
  id: string;
  externalOfferId?: string;
  startDate: string;
  endDate: string;
  detectedAt: string;
  game: {
    id: string;
    title: string;
    slug: string;
    developer?: string;
    publisher?: string;
  };
  store: {
    id: string;
    name: string;
  };
};

@Injectable()
export class FreeOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async listActiveOffers(now = new Date()): Promise<FreeOfferView[]> {
    const offers = await this.prisma.freeGameOffer.findMany({
      where: {
        endDate: {
          gte: now,
        },
      },
      include: {
        game: true,
        store: true,
      },
      orderBy: [{ startDate: 'asc' }, { detectedAt: 'desc' }],
    });

    return offers.map((offer) => ({
      id: offer.id,
      externalOfferId: offer.externalOfferId ?? undefined,
      startDate: offer.startDate.toISOString(),
      endDate: offer.endDate.toISOString(),
      detectedAt: offer.detectedAt.toISOString(),
      game: {
        id: offer.game.id,
        title: offer.game.title,
        slug: offer.game.slug,
        developer: offer.game.developer ?? undefined,
        publisher: offer.game.publisher ?? undefined,
      },
      store: {
        id: offer.store.id,
        name: offer.store.name,
      },
    }));
  }
}
