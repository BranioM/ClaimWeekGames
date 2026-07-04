import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InternalApiKeyGuard } from '../security/internal-api-key.guard.js';
import { AuthService } from './auth.service.js';
import { AuthenticatedUserGuard } from './authenticated-user.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AuthenticatedUser } from './auth.types.js';

type CreateSessionRequest = {
  userId: string;
};

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthenticatedUserGuard)
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  @Post('internal/auth/sessions')
  @UseGuards(InternalApiKeyGuard)
  createSession(@Body() body: unknown) {
    const request = parseCreateSessionRequest(body);

    return this.authService.createSessionForUser(request.userId);
  }
}

function parseCreateSessionRequest(body: unknown): CreateSessionRequest {
  if (!isRecord(body)) {
    throw new BadRequestException('Request body must be an object');
  }

  const userId = asString(body.userId);

  if (!userId) {
    throw new BadRequestException('userId is required');
  }

  return { userId };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}
