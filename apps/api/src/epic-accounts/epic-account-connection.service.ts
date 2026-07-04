import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ConnectEpicAccountInput,
  ConnectedEpicAccount,
  EpicAccountConnectionState,
} from './epic-account.types.js';

const EPIC_PLATFORM_NAME = 'Epic Games Store';
const CONNECTION_STATE_TTL_MS = 10 * 60 * 1000;
const STATE_BYTES = 32;

@Injectable()
export class EpicAccountConnectionService {
  constructor(private readonly prisma: PrismaService) {}

  async createConnectionState(
    userId: string,
  ): Promise<EpicAccountConnectionState> {
    const platform = await this.ensureEpicPlatform();
    const state = randomBytes(STATE_BYTES).toString('base64url');
    const expiresAt = new Date(Date.now() + CONNECTION_STATE_TTL_MS);

    await this.prisma.accountConnectionState.create({
      data: {
        userId,
        platformId: platform.id,
        stateHash: hashState(state),
        expiresAt,
      },
    });

    return {
      state,
      expiresAt,
    };
  }

  async connectAccount(
    input: ConnectEpicAccountInput,
  ): Promise<ConnectedEpicAccount> {
    const platform = await this.ensureEpicPlatform();
    const stateHash = hashState(input.state);
    const now = new Date();
    const connectionState = await this.prisma.accountConnectionState.findUnique(
      {
        where: { stateHash },
      },
    );

    if (
      !connectionState ||
      connectionState.userId !== input.userId ||
      connectionState.platformId !== platform.id ||
      connectionState.consumedAt ||
      connectionState.expiresAt <= now
    ) {
      throw new BadRequestException('Invalid or expired connection state');
    }

    const connectedAccount = await this.prisma.$transaction(async (tx) => {
      await tx.accountConnectionState.update({
        where: { id: connectionState.id },
        data: { consumedAt: now },
      });

      return tx.connectedAccount.upsert({
        where: {
          platformId_externalAccountId: {
            platformId: platform.id,
            externalAccountId: input.externalAccountId,
          },
        },
        create: {
          userId: input.userId,
          platformId: platform.id,
          accountKey: `epic:${input.externalAccountId}`,
          externalAccountId: input.externalAccountId,
          displayName: input.displayName,
          status: 'ACTIVE',
          disconnectedAt: null,
        },
        update: {
          userId: input.userId,
          accountKey: `epic:${input.externalAccountId}`,
          displayName: input.displayName,
          status: 'ACTIVE',
          disconnectedAt: null,
        },
      });
    });

    return {
      id: connectedAccount.id,
      userId: connectedAccount.userId,
      platformId: connectedAccount.platformId,
      externalAccountId: connectedAccount.externalAccountId ?? '',
      displayName: connectedAccount.displayName ?? undefined,
    };
  }

  private ensureEpicPlatform() {
    return this.prisma.platform.upsert({
      where: { name: EPIC_PLATFORM_NAME },
      create: { name: EPIC_PLATFORM_NAME },
      update: {},
    });
  }
}

function hashState(state: string): string {
  return createHash('sha256').update(state, 'utf8').digest('hex');
}
