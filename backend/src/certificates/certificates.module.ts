import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificate, CertificateSchema } from './certificate.schema';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Certificate.name, schema: CertificateSchema }])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  /** Used by Media to refuse deleting certificate images. */
  exports: [CertificatesService],
})
export class CertificatesModule {}
