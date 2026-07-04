import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module.js';
import { SyncJobsController } from './sync-jobs.controller.js';
import { SyncJobsService } from './sync-jobs.service.js';

@Module({
  imports: [SecurityModule],
  controllers: [SyncJobsController],
  providers: [SyncJobsService],
})
export class SyncJobsModule {}
