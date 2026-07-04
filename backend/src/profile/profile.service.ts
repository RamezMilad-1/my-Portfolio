import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(Profile.name) private model: Model<ProfileDocument>) {}

  async get() {
    const existing = await this.model.findById('singleton').exec();
    if (existing) return existing.toObject();
    // Bare singleton — all content comes from the DB via the admin panel;
    // schema defaults keep every field empty until it's filled in.
    const created = await this.model.create({ _id: 'singleton' });
    return created.toObject();
  }

  async update(dto: UpdateProfileDto) {
    return this.model
      .findByIdAndUpdate('singleton', dto, { new: true, upsert: true })
      .exec();
  }
}
