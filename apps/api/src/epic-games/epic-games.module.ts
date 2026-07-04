import { Module } from '@nestjs/common';
import { EpicGamesCheckoutService } from './epic-games-checkout.service.js';
import { EpicGamesClientService } from './epic-games-client.service.js';
import { EpicGamesSyncService } from './epic-games-sync.service.js';

@Module({
  providers: [
    EpicGamesCheckoutService,
    EpicGamesClientService,
    EpicGamesSyncService,
  ],
  exports: [EpicGamesSyncService],
})
export class EpicGamesModule {}
