import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ClientIpThrottlerGuard } from './common/client-ip-throttler.guard';
import { MongoExceptionFilter } from './common/mongo-exception.filter';
import { AppConfigModule, DatabaseModule } from './config/config.modules';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { MessagesModule } from './messages/messages.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamModule } from './team/team.module';
import { TechModule } from './tech/tech.module';
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: minutes(1), limit: 100 }]),
    AuthModule,
    HealthModule,
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
    // The session guard is registered globally by AuthModule.
    { provide: APP_GUARD, useClass: ClientIpThrottlerGuard },
    { provide: APP_FILTER, useClass: MongoExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
