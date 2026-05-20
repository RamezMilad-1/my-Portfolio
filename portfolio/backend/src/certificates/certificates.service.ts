import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certificate, CertificateDocument } from './certificate.schema';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name) private model: Model<CertificateDocument>,
  ) {}

  listPublic() {
    return this.model
      .find({ isPublished: true })
      .sort({ position: 1, createdAt: -1 })
      .lean()
      .exec();
  }

  listAll() {
    return this.model
      .find()
      .sort({ position: 1, createdAt: -1 })
      .lean()
      .exec();
  }

  async getById(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Certificate not found');
    return doc;
  }

  create(dto: CreateCertificateDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateCertificateDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Certificate not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Certificate not found');
    return { ok: true };
  }
}
