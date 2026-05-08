import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { MediaModule } from './media/media.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      // Global default: 100 requests per minute per IP. Sufficient for normal
      // public-portfolio traffic; stricter limits live on individual routes.
      { ttl: 60_000, limit: 100 },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGO_URI', 'mongodb://localhost:27017/ramez_portfolio'),
      }),
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        {
          rootPath: join(process.cwd(), cfg.get<string>('UPLOADS_DIR', './uploads')),
          serveRoot: '/uploads',
        },
      ],
    }),
    AuthModule,
    AdminsModule,
    ProfileModule,
    ProjectsModule,
    MediaModule,
    TeamModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
