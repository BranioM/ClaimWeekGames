import { Module } from '@nestjs/common';
import { InternalApiKeyGuard } from './internal-api-key.guard.js';

@Module({
  providers: [InternalApiKeyGuard],
  exports: [InternalApiKeyGuard],
})
export class SecurityModule {}
