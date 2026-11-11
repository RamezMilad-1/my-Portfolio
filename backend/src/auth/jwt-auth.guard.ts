import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { isMongoId } from 'class-validator';
import type { Request } from 'express';
import { AdminsService } from '../admins/admins.service';
import { IS_PUBLIC_KEY } from '../common/public.decorator';
import type { SessionPayload } from './auth.types';
import { SessionCookie } from './session-cookie';

/**
 * Global guard: every route needs a valid admin session unless marked `@Public()`.
 * The account is re-read on each request, so demoting or deleting it in the database
 * ends its sessions immediately.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly cookie: SessionCookie,
    private readonly admins: AdminsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.cookie.read(req);
    if (!token) throw new UnauthorizedException();

    let payload: SessionPayload;
    try {
      payload = await this.jwt.verifyAsync<SessionPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }
    if (!isMongoId(payload.sub)) throw new UnauthorizedException();

    const account = await this.admins.findAdminById(payload.sub);
    if (!account) throw new UnauthorizedException();

    req.admin = { id: account._id.toString(), email: account.email };
    return true;
  }
}
