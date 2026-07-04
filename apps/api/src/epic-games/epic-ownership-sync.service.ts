import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { slugify } from './slug.js';

const EPIC_PLATFORM_NAME = 'Epic Games Store';

export type EpicOwnedGame = {
  providerGameId: string;
  title: string;
  slug?: string;
  developer?: string;
  publisher?: string;
  acquiredAt?: Date;
};

export type EpicOwnershipSyncResult = {
  connectedAccountId: string;
  gamesSeen: number;
  ownershipsSynced: number;
  syncedAt: string;
};

@Injectable()
export class EpicOwnershipSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncOwnedGames(
    connectedAccountId: string,
    ownedGames: EpicOwnedGame[],
  ): Promise<EpicOwnershipSyncResult> {
    const connectedAccount = await this.prisma.connectedAccount.findUnique({
      where: { id: connectedAccountId },
      include: { platform: true },
    });

    if (
      !connectedAccount ||
      connectedAccount.platform.name !== EPIC_PLATFORM_NAME ||
      connectedAccount.status !== 'ACTIVE'
    ) {
      throw new BadRequestException(
        'Active Epic connected account is required',
      );
    }

    let ownershipsSynced = 0;
    const syncedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      for (const ownedGame of ownedGames) {
        const game = await tx.game.upsert({
          where: { slug: ownedGame.slug ?? slugify(ownedGame.title) },
          create: {
            title: ownedGame.title,
            slug: ownedGame.slug ?? slugify(ownedGame.title),
            developer: ownedGame.developer,
            publisher: ownedGame.publisher,
          },
          update: {
            title: ownedGame.title,
            developer: ownedGame.developer,
            publisher: ownedGame.publisher,
          },
        });

        await tx.externalGameId.upsert({
          where: {
            platformId_providerGameId: {
              platformId: connectedAccount.platformId,
              providerGameId: ownedGame.providerGameId,
            },
          },
          create: {
            platformId: connectedAccount.platformId,
            gameId: game.id,
            providerGameId: ownedGame.providerGameId,
          },
          update: {
            gameId: game.id,
          },
        });

        await tx.ownership.upsert({
          where: {
            connectedAccountId_gameId: {
              connectedAccountId,
              gameId: game.id,
            },
          },
          create: {
            connectedAccountId,
            gameId: game.id,
            acquiredAt: ownedGame.acquiredAt,
          },
          update: {
            acquiredAt: ownedGame.acquiredAt,
          },
        });

        ownershipsSynced += 1;
      }

      await tx.connectedAccount.update({
        where: { id: connectedAccountId },
        data: { lastSyncedAt: syncedAt },
      });
    });

    return {
      connectedAccountId,
      gamesSeen: ownedGames.length,
      ownershipsSynced,
      syncedAt: syncedAt.toISOString(),
    };
  }
}
