import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from './auth.types.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context
      .switchToHttp()
      .getRequest<Request & AuthenticatedRequest>();

    if (!request.user) {
      throw new Error('CurrentUser used without AuthenticatedUserGuard');
    }

    return request.user;
  },
);
