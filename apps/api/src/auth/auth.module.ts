import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthenticatedUserGuard } from './authenticated-user.guard.js';

@Module({
  imports: [SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, AuthenticatedUserGuard],
  exports: [AuthService, AuthenticatedUserGuard],
})
export class AuthModule {}
