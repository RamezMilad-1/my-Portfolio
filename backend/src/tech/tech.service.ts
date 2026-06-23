import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TechItem, TechItemDocument } from './tech.schema';
import { CreateTechItemDto, UpdateTechItemDto } from './dto/tech.dto';

@Injectable()
export class TechService {
  constructor(
    @InjectModel(TechItem.name) private model: Model<TechItemDocument>,
  ) {}

  listPublic() {
    return this.model
      .find({ isPublished: true })
      .sort({ position: 1, name: 1 })
      .lean()
      .exec();
  }

  listAll() {
    return this.model
      .find()
      .sort({ position: 1, name: 1 })
      .lean()
      .exec();
  }

  async getById(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Tech item not found');
    return doc;
  }

  create(dto: CreateTechItemDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateTechItemDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Tech item not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Tech item not found');
    return { ok: true };
  }
}
