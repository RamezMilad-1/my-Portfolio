import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { Media, MediaDocument } from './media.schema';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private model: Model<MediaDocument>,
    private cfg: ConfigService,
  ) {}

  list() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }

  async create(file: Express.Multer.File, projectId?: string, caption?: string) {
    const isImage = file.mimetype.startsWith('image/');
    const kind: 'image' | 'video' = isImage ? 'image' : 'video';
    const subdir = isImage ? 'images' : 'videos';
    const url = `/uploads/${subdir}/${file.filename}`;
    const created = await this.model.create({
      kind,
      storagePath: file.path,
      url,
      caption: caption ?? '',
      sizeBytes: file.size,
      originalName: file.originalname,
      projectId: projectId ? new Types.ObjectId(projectId) : undefined,
    });
    return created;
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
      await unlink(resolve(doc.storagePath));
    } catch {
      /* file may already be missing — fine */
    }
    await this.model.findByIdAndDelete(id).exec();
    return { ok: true };
  }

  uploadsDir() {
    return resolve(this.cfg.get<string>('UPLOADS_DIR', './uploads'));
  }

  imagesDir() {
    return join(this.uploadsDir(), 'images');
  }

  videosDir() {
    return join(this.uploadsDir(), 'videos');
  }
}
