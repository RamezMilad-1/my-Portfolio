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
    const created = await this.model.create({
      _id: 'singleton',
      displayName: 'Ramez Milad',
      headline: '3rd-year Computer Science student · Software Engineering major',
    });
    return created.toObject();
  }

  async update(dto: UpdateProfileDto) {
    return this.model
      .findByIdAndUpdate('singleton', dto, { new: true, upsert: true })
      .exec();
  }
}
