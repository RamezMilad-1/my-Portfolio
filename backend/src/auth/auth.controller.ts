import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { minutes, Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../common/public.decorator';
import { AuthService } from './auth.service';
import type { AuthenticatedAdmin } from './auth.types';
import { CurrentAdmin } from './current-admin.decorator';
import { LoginDto } from './dto/login.dto';
import { SessionCookie } from './session-cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookie: SessionCookie,
  ) {}

  /** 5 attempts per minute per visitor: brute-force protection for the admin password. */
  @Public()
  @Throttle({ default: { limit: 5, ttl: minutes(1) } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, admin } = await this.auth.login(dto.email, dto.password);
    this.cookie.set(res, token);
    return { admin };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    this.cookie.clear(res);
    return { ok: true };
  }

  @Get('me')
  me(@CurrentAdmin() admin: AuthenticatedAdmin) {
    return { admin };
  }
}
