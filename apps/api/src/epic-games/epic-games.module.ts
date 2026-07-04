import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module.js';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesSyncService } from './epic-games-sync.service.js';
import { EpicOwnershipSyncService } from './epic-ownership-sync.service.js';
import { EpicSyncController } from './epic-sync.controller.js';

@Module({
  imports: [SecurityModule],
  controllers: [EpicSyncController],
  providers: [
    EpicGamesCheckoutService,
    EpicGamesClientService,
    EpicGamesSyncService,
    EpicOwnershipSyncService,
  ],
  exports: [EpicGamesSyncService, EpicOwnershipSyncService],
})
export class EpicGamesModule {}
