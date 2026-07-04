import { Module } from '@nestjs/common';
import { EpicGamesSyncService } from './epic-games-sync.service.js';

@Module({
  providers: [EpicGamesSyncService],
  exports: [EpicGamesSyncService],
})
export class EpicGamesModule {}
