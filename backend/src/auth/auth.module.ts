import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AdminsModule } from '../admins/admins.module';
import type { AppConfig } from '../config/config.modules';
import { SESSION_TTL_SECONDS } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionCookie } from './session-cookie';

@Module({
  imports: [
    AdminsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: AppConfig) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: SESSION_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionCookie, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AuthModule {}
