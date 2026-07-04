import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { EpicAccountsModule } from './epic-accounts/epic-accounts.module.js';
import { EpicGamesModule } from './epic-games/epic-games.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    EpicAccountsModule,
    EpicGamesModule,
  ],
})
export class AppModule {}
