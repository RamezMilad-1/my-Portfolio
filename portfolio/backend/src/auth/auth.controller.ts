import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, admin } = await this.auth.login(dto.email, dto.password);
    res.cookie(this.cookieName(), token, this.cookieOptions());
    return { admin };
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
