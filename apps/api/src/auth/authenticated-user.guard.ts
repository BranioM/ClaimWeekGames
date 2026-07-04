import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { AuthenticatedRequest } from './auth.types.js';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class AuthenticatedUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & AuthenticatedRequest>();
    const token = parseBearerToken(request.header('authorization'));

    request.user = await this.authService.authenticateBearerToken(token);

    return true;
  }
}

function parseBearerToken(header: string | undefined): string | undefined {
  if (!header?.startsWith(BEARER_PREFIX)) {
    return undefined;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  if (!token || token.includes(' ')) {
    throw new UnauthorizedException('Valid bearer token is required');
  }

  return token;
}
