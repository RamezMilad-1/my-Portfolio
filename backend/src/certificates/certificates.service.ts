import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublishableCollectionService } from '../common/publishable-collection.service';
import { Certificate } from './certificate.schema';
import type { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';

@Injectable()
export class CertificatesService extends PublishableCollectionService<
  Certificate,
  CreateCertificateDto,
  UpdateCertificateDto
> {
  constructor(@InjectModel(Certificate.name) model: Model<Certificate>) {
    super(model, { position: 1, createdAt: -1 }, 'Certificate not found');
  }

  /** Labels for the certificates that show this file. */
  async findMediaUsage(url: string): Promise<string[]> {
    const certificates = await this.model.find({ imageUrl: url }, { title: 1 }).lean().exec();
    return certificates.map((certificate) => `certificate “${certificate.title}”`);
  }
}
