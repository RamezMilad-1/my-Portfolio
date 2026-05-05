import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from '../admins/admins.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly admins: AdminsService,
    cfg: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieName = cfg.get<string>('COOKIE_NAME', 'ramez_session');
        return req?.cookies?.[cookieName] ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const admin = await this.admins.findById(payload.sub);
    if (!admin) throw new UnauthorizedException();
    return { id: admin._id.toString(), email: admin.email };
  }
}
