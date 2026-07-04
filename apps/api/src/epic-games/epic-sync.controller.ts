import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InternalApiKeyGuard } from '../security/internal-api-key.guard.js';
import { EpicGamesSyncService } from './epic-games-sync.service.js';
import {
  EpicOwnedGame,
  EpicOwnershipSyncService,
} from './epic-ownership-sync.service.js';

type OwnershipSyncRequest = {
  connectedAccountId: string;
  ownedGames: EpicOwnedGame[];
};

@Controller('internal/epic/sync')
@UseGuards(InternalApiKeyGuard)
export class EpicSyncController {
  constructor(
    private readonly epicGamesSyncService: EpicGamesSyncService,
    private readonly epicOwnershipSyncService: EpicOwnershipSyncService,
  ) {}

  @Post('free-offers')
  syncFreeOffers() {
    return this.epicGamesSyncService.syncFreeGames();
  }

  @Post('ownerships')
  syncOwnerships(@Body() body: unknown) {
    const request = parseOwnershipSyncRequest(body);

    return this.epicOwnershipSyncService.syncOwnedGames(
      request.connectedAccountId,
      request.ownedGames,
    );
  }
}

function parseOwnershipSyncRequest(body: unknown): OwnershipSyncRequest {
  if (!isRecord(body)) {
    throw new BadRequestException('Request body must be an object');
  }

  const connectedAccountId = asString(body.connectedAccountId);
  const ownedGames = body.ownedGames;

  if (!connectedAccountId) {
    throw new BadRequestException('connectedAccountId is required');
  }

  if (!Array.isArray(ownedGames)) {
    throw new BadRequestException('ownedGames must be an array');
  }

  if (ownedGames.length > 500) {
    throw new BadRequestException('ownedGames must contain at most 500 items');
  }

  return {
    connectedAccountId,
    ownedGames: ownedGames.map(parseOwnedGame),
  };
}

function parseOwnedGame(value: unknown): EpicOwnedGame {
  if (!isRecord(value)) {
    throw new BadRequestException('ownedGames items must be objects');
  }

  const providerGameId = asString(value.providerGameId);
  const title = asString(value.title);

  if (!providerGameId || !title) {
    throw new BadRequestException(
      'ownedGames items require providerGameId and title',
    );
  }

  return {
    providerGameId,
    title,
    slug: asString(value.slug),
    developer: asString(value.developer),
    publisher: asString(value.publisher),
    acquiredAt: parseOptionalDate(value.acquiredAt),
  };
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const dateValue = asString(value);

  if (!dateValue) {
    throw new BadRequestException('acquiredAt must be an ISO date string');
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('acquiredAt must be an ISO date string');
  }

  return date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}
