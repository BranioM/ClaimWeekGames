import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module.js';
import { EpicAccountConnectionService } from './epic-account-connection.service.js';
import { EpicAccountsController } from './epic-accounts.controller.js';

@Module({
  imports: [SecurityModule],
  controllers: [EpicAccountsController],
  providers: [EpicAccountConnectionService],
  exports: [EpicAccountConnectionService],
})
export class EpicAccountsModule {}
