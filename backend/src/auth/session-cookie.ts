import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../config/env';
import { SESSION_TTL_SECONDS } from './auth.constants';

/** The httpOnly session cookie — one definition for setting, clearing and reading it. */
@Injectable()
export class SessionCookie {
  private readonly name: string;
  private readonly options: CookieOptions;

  constructor(config: ConfigService<Env, true>) {
    this.name = config.get('COOKIE_NAME', { infer: true });
    this.options = {
      httpOnly: true,
      secure: config.get('COOKIE_SECURE', { infer: true }),
      sameSite: config.get('COOKIE_SAMESITE', { infer: true }),
      path: '/',
    };
  }

  set(res: Response, token: string): void {
    res.cookie(this.name, token, { ...this.options, maxAge: SESSION_TTL_SECONDS * 1000 });
  }

  /** Browsers only delete a cookie when the attributes match the ones it was set with. */
  clear(res: Response): void {
    res.clearCookie(this.name, this.options);
  }

  read(req: Request): string | undefined {
    const value: unknown = (req.cookies as Record<string, unknown> | undefined)?.[this.name];
    return typeof value === 'string' && value !== '' ? value : undefined;
  }
}
