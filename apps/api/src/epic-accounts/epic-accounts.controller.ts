import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InternalApiKeyGuard } from '../security/internal-api-key.guard.js';
import { EpicAccountConnectionService } from './epic-account-connection.service.js';

type ConnectionStateRequest = {
  userId: string;
};

type ConnectAccountRequest = {
  userId: string;
  state: string;
  externalAccountId: string;
  displayName?: string;
};

@Controller('internal/epic/accounts')
@UseGuards(InternalApiKeyGuard)
export class EpicAccountsController {
  constructor(
    private readonly epicAccountConnectionService: EpicAccountConnectionService,
  ) {}

  @Post('connection-state')
  createConnectionState(@Body() body: unknown) {
    const request = parseConnectionStateRequest(body);

    return this.epicAccountConnectionService.createConnectionState(
      request.userId,
    );
  }

  @Post('connect')
  connectAccount(@Body() body: unknown) {
    return this.epicAccountConnectionService.connectAccount(
      parseConnectAccountRequest(body),
    );
  }
}

function parseConnectionStateRequest(body: unknown): ConnectionStateRequest {
  if (!isRecord(body)) {
    throw new BadRequestException('Request body must be an object');
  }

  const userId = asString(body.userId);

  if (!userId) {
    throw new BadRequestException('userId is required');
  }

  return { userId };
}

function parseConnectAccountRequest(body: unknown): ConnectAccountRequest {
  if (!isRecord(body)) {
    throw new BadRequestException('Request body must be an object');
  }

  const userId = asString(body.userId);
  const state = asString(body.state);
  const externalAccountId = asString(body.externalAccountId);

  if (!userId) {
    throw new BadRequestException('userId is required');
  }

  if (!state) {
    throw new BadRequestException('state is required');
  }

  if (!externalAccountId) {
    throw new BadRequestException('externalAccountId is required');
  }

  return {
    userId,
    state,
    externalAccountId,
    displayName: asString(body.displayName),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}
