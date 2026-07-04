import { Module } from '@nestjs/common';
import { EpicAccountConnectionService } from './epic-account-connection.service.js';

@Module({
  providers: [EpicAccountConnectionService],
  exports: [EpicAccountConnectionService],
})
export class EpicAccountsModule {}
