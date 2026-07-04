import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cfg: ConfigService,
  ) {}

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.cfg.get<string>('COOKIE_SECURE', 'false') === 'true',
      sameSite:
        (this.cfg.get<'lax' | 'strict' | 'none'>('COOKIE_SAMESITE', 'lax') as
          | 'lax'
          | 'strict'
          | 'none'),
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  private cookieName() {
    return this.cfg.get<string>('COOKIE_NAME', 'ramez_session');
  }

  // Stricter rate limit on login: 5 attempts per minute per IP.
  // Defense against brute-force on the single admin password.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, admin } = await this.auth.login(dto.email, dto.password);
    res.cookie(this.cookieName(), token, this.cookieOptions());
    return { admin };
  }

  // Creates a plain 'user' account that cannot sign in until its role is
  // flipped to 'admin' directly in the database. Tightly rate-limited, and
  // can be disabled entirely with AUTH_REGISTER_ENABLED=false (responds 404
  // as if the route didn't exist).
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterDto) {
    const enabled =
      this.cfg.get<string>('AUTH_REGISTER_ENABLED', 'true') !== 'false';
    if (!enabled) throw new NotFoundException();
    return this.auth.register(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(this.cookieName(), { path: '/' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return { admin: req.user };
  }
}
