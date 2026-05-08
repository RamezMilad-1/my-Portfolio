import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import {
  CreateProjectDto,
  ReorderProjectsDto,
  UpdateProjectDto,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private model: Model<ProjectDocument>) {}

  listPublic() {
    return this.model
      .find({ status: 'published' })
      .sort({ position: 1, createdAt: -1 })
      .populate('media')
      .populate('team.memberId')
      .lean()
      .exec();
  }

  listAll() {
    return this.model
      .find()
      .sort({ position: 1, createdAt: -1 })
      .populate('media')
      .populate('team.memberId')
      .lean()
      .exec();
  }

  async getBySlug(slug: string) {
    const doc = await this.model
      .findOne({ slug: slug.toLowerCase() })
      .populate('media')
      .populate('team.memberId')
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Project not found');
    return doc;
  }

  async getById(id: string) {
    const doc = await this.model
      .findById(id)
      .populate('media')
      .populate('team.memberId')
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Project not found');
    return doc;
  }

  create(dto: CreateProjectDto) {
    const { team, media, ...rest } = dto;
    const doc: Record<string, unknown> = {
      ...rest,
      slug: dto.slug.toLowerCase(),
    };
    if (team) {
      doc.team = team.map((t) => ({
        memberId: new Types.ObjectId(t.memberId),
      }));
    }
    if (media) {
      doc.media = media.map((m) => new Types.ObjectId(m));
    }
    return this.model.create(doc);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = dto.slug.toLowerCase();
    if (dto.team) {
      update.team = dto.team.map((t) => ({
        memberId: new Types.ObjectId(t.memberId),
      }));
    }
    if (dto.media) {
      update.media = dto.media.map((m) => new Types.ObjectId(m));
    }
    const updated = await this.model
      .findByIdAndUpdate(id, update, { new: true })
      .populate('media')
      .populate('team.memberId')
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Project not found');
    return { ok: true };
  }

  async reorder(dto: ReorderProjectsDto) {
    await Promise.all(
      dto.items.map((it) =>
        this.model.updateOne({ _id: it.id }, { position: it.position }).exec(),
      ),
    );
    return { ok: true };
  }
}
