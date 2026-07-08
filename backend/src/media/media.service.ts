import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Media, MediaDocument } from './media.schema';

/** Cloudinary folder that holds every portfolio upload. */
const CLOUDINARY_FOLDER = 'portfolio';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private model: Model<MediaDocument>,
    private cfg: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.cfg.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.cfg.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.cfg.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  list() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }

  async create(file: Express.Multer.File, projectId?: string, caption?: string) {
    const isImage = file.mimetype.startsWith('image/');
    const kind: 'image' | 'video' = isImage ? 'image' : 'video';

    const uploaded = await this.uploadToCloudinary(file.buffer, kind);

    const created = await this.model.create({
      kind,
      // public_id doubles as the storage handle — used by remove() to delete
      // the asset from Cloudinary, the same way local paths were unlinked.
      storagePath: uploaded.public_id,
      url: uploaded.secure_url,
      caption: caption ?? '',
      sizeBytes: file.size,
      originalName: file.originalname,
      projectId: projectId ? new Types.ObjectId(projectId) : undefined,
    });
    return created;
  }

  private uploadToCloudinary(
    buffer: Buffer,
    kind: 'image' | 'video',
  ): Promise<UploadApiResponse> {
    return new Promise((res, rej) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          public_id: randomUUID(),
          resource_type: kind,
          overwrite: false,
        },
        (err, result) => {
          if (err || !result) {
            return rej(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${err?.message ?? 'no result'}`,
              ),
            );
          }
          res(result);
        },
      );
      stream.end(buffer);
    });
  }

  async update(id: string, dto: { caption?: string; projectId?: string }) {
    const set: Record<string, unknown> = {};
    if (dto.caption !== undefined) set.caption = dto.caption;
    if (dto.projectId) set.projectId = new Types.ObjectId(dto.projectId);
    const updated = await this.model
      .findByIdAndUpdate(id, { $set: set }, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Media not found');
    return updated;
  }

  async remove(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Media not found');
    try {
      await cloudinary.uploader.destroy(doc.storagePath, {
        resource_type: doc.kind === 'video' ? 'video' : 'image',
      });
    } catch {
      /* asset may already be gone on Cloudinary — fine */
    }
    await this.model.findByIdAndDelete(id).exec();
    return { ok: true };
  }
}
