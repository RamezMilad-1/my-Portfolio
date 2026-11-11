import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CertificatesService } from '../certificates/certificates.service';
import { ProfileService } from '../profile/profile.service';
import { ProjectsService } from '../projects/projects.service';
import { schemaFields } from '../common/schema-fields';
import { CloudinaryService, type UploadTicket } from './cloudinary.service';
import type { CreateMediaDto, CreateUploadTicketDto, UpdateMediaDto } from './dto/media.dto';
import { type MediaKind, UPLOAD_TYPES } from './media.constants';
import { Media, MediaSchema } from './media.schema';

const MEDIA_FIELDS = schemaFields(MediaSchema);

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly model: Model<Media>,
    private readonly cloudinary: CloudinaryService,
    private readonly projects: ProjectsService,
    private readonly profile: ProfileService,
    private readonly certificates: CertificatesService,
  ) {}

  list() {
    return this.model.find().select(MEDIA_FIELDS).sort({ createdAt: -1 }).lean().exec();
  }

  createUploadTicket({
    mimeType,
    size,
  }: CreateUploadTicketDto): UploadTicket & { kind: MediaKind } {
    const type = UPLOAD_TYPES[mimeType];
    if (size > type.maxBytes) {
      throw new BadRequestException(`File is too large (max ${type.maxBytes / 1024 / 1024} MB)`);
    }
    return { ...this.cloudinary.createUploadTicket(type.kind, type.extension), kind: type.kind };
  }

  async create(dto: CreateMediaDto) {
    const asset = await this.cloudinary.getAsset(dto.publicId, dto.kind);
    const media = await this.model.create({
      kind: dto.kind,
      storagePath: dto.publicId,
      url: asset.url,
      sizeBytes: asset.bytes,
      originalName: dto.originalName,
      caption: dto.caption ?? '',
      projectId: dto.projectId,
    });
    return media.toObject();
  }

  async update(id: string, dto: UpdateMediaDto) {
    const media = await this.model
      .findByIdAndUpdate(
        id,
        { $set: dto },
        { new: true, runValidators: true, projection: MEDIA_FIELDS },
      )
      .lean()
      .exec();
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  /**
   * Refuses to delete a file that is still shown somewhere, instead of leaving broken images
   * behind; the message names every place that still uses it.
   */
  async remove(id: string): Promise<void> {
    const media = await this.model.findById(id).lean().exec();
    if (!media) throw new NotFoundException('Media not found');

    const usedBy = (
      await Promise.all([
        this.projects.findMediaUsage(media._id.toString(), media.url),
        this.profile.findMediaUsage(media.url),
        this.certificates.findMediaUsage(media.url),
      ])
    ).flat();
    if (usedBy.length > 0) {
      throw new ConflictException(`Still used by ${usedBy.join(', ')} — remove it there first.`);
    }

    await this.cloudinary.destroy(media.storagePath, media.kind);
    await this.model.deleteOne({ _id: media._id }).exec();
  }
}
