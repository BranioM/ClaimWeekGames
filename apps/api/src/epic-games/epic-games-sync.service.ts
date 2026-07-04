import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type EpicGamesSyncResult = {
  platformId: string;
  offersSeen: number;
  syncedAt: string;
};

@Injectable()
export class EpicGamesSyncService {
  private readonly logger = new Logger(EpicGamesSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncFreeGames(): Promise<EpicGamesSyncResult> {
    const platform = await this.prisma.platform.upsert({
      where: { name: 'Epic Games Store' },
      create: { name: 'Epic Games Store' },
      update: {},
    });

    this.logger.debug('Epic Games sync foundation initialized');

    return {
      platformId: platform.id,
      offersSeen: 0,
      syncedAt: new Date().toISOString(),
    };
  }
}
