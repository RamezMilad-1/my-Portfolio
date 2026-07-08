import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { MediaModule } from './media/media.module';
import { TeamModule } from './team/team.module';
import { CertificatesModule } from './certificates/certificates.module';
import { TimelineModule } from './timeline/timeline.module';
import { TechModule } from './tech/tech.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 100 },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGO_URI', 'mongodb://localhost:27017/ramez_portfolio'),
      }),
    }),
    HealthModule,
    AuthModule,
    AdminsModule,
    ProfileModule,
    ProjectsModule,
    MediaModule,
    TeamModule,
    CertificatesModule,
    TimelineModule,
    TechModule,
    MessagesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
