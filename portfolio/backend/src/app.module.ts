import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { MediaModule } from './media/media.module';
import { TeamModule } from './team/team.module';
import { ScannerModule } from './scanner/scanner.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ScannerModule,
  ],
})
export class AppModule {}
