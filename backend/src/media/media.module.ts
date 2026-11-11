import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesModule } from '../certificates/certificates.module';
import { ProfileModule } from '../profile/profile.module';
import { ProjectsModule } from '../projects/projects.module';
import { CloudinaryService } from './cloudinary.service';
import { MediaController } from './media.controller';
import { Media, MediaSchema } from './media.schema';
import { MediaService } from './media.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    ProjectsModule,
    ProfileModule,
    CertificatesModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService],
})
export class MediaModule {}
