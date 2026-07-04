import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthenticatedUser, CreatedSession } from './auth.types.js';

const SESSION_TOKEN_BYTES = 32;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createSessionForUser(userId: string): Promise<CreatedSession> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('Valid user is required');
    }

    const token = randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
      },
    });

    return {
      token,
      expiresAt,
      user,
    };
  }

  async authenticateBearerToken(
    token: string | undefined,
  ): Promise<AuthenticatedUser> {
    if (!token) {
      throw new UnauthorizedException('Valid bearer token is required');
    }

    const now = new Date();
    const session = await this.prisma.userSession.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= now) {
      throw new UnauthorizedException('Valid bearer token is required');
    }

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { lastUsedAt: now },
    });

    return session.user;
  }
}

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
