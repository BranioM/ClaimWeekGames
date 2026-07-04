import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { EpicAccountsModule } from './epic-accounts/epic-accounts.module.js';
import { EpicGamesModule } from './epic-games/epic-games.module.js';
import { FreeOffersModule } from './free-offers/free-offers.module.js';
import { HealthModule } from './health/health.module.js';
import { SchedulerModule } from './scheduler/scheduler.module.js';
import { SecurityModule } from './security/security.module.js';
import { SyncJobsModule } from './sync-jobs/sync-jobs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SecurityModule,
    AuthModule,
    HealthModule,
    FreeOffersModule,
    SyncJobsModule,
    EpicAccountsModule,
    EpicGamesModule,
    SchedulerModule,
  ],
})
export class AppModule {}
