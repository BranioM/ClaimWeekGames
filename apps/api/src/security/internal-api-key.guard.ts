import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

const API_KEY_HEADER = 'x-api-key';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredApiKey = this.configService.get<string>('INTERNAL_API_KEY');
    const request = context.switchToHttp().getRequest<Request>();
    const providedApiKey = request.header(API_KEY_HEADER);

    if (!configuredApiKey || !providedApiKey) {
      throw new UnauthorizedException('Valid internal API key is required');
    }

    if (!secureCompare(providedApiKey, configuredApiKey)) {
      throw new UnauthorizedException('Valid internal API key is required');
    }

    return true;
  }
}

function secureCompare(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');

  return left.length === right.length && timingSafeEqual(left, right);
}
