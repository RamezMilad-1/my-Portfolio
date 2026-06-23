import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TimelineEntry,
  TimelineEntryDocument,
} from './timeline.schema';
import {
  CreateTimelineEntryDto,
  UpdateTimelineEntryDto,
} from './dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(TimelineEntry.name)
    private model: Model<TimelineEntryDocument>,
  ) {}

  listPublic() {
    return this.model
      .find({ isPublished: true })
      .sort({ position: 1, year: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  listAll() {
    return this.model
      .find()
      .sort({ position: 1, year: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async getById(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Timeline entry not found');
    return doc;
  }

  create(dto: CreateTimelineEntryDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateTimelineEntryDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Timeline entry not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Timeline entry not found');
    return { ok: true };
  }
}
