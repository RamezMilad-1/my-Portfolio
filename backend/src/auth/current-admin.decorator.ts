import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedAdmin } from './auth.types';

/** The admin `JwtAuthGuard` attached to the request. */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAdmin => {
    const admin = context.switchToHttp().getRequest<Request>().admin;
    if (!admin) throw new UnauthorizedException();
    return admin;
  },
);
