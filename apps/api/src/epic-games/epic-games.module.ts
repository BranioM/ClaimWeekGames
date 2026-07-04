import { Module } from '@nestjs/common';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesSyncService } from './epic-games-sync.service.js';
import { EpicOwnershipSyncService } from './epic-ownership-sync.service.js';

@Module({
  providers: [
    EpicGamesCheckoutService,
    EpicGamesClientService,
    EpicGamesSyncService,
    EpicOwnershipSyncService,
  ],
  exports: [EpicGamesSyncService, EpicOwnershipSyncService],
})
export class EpicGamesModule {}
