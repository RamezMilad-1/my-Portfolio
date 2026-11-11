import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { schemaFields } from '../common/schema-fields';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile, PROFILE_ID, ProfileSchema } from './profile.schema';

const PROFILE_FIELDS = schemaFields(ProfileSchema);

@Injectable()
export class ProfileService {
  constructor(@InjectModel(Profile.name) private readonly model: Model<Profile>) {}

  /** Before the first save there is no document yet; respond with the schema defaults. */
  async get() {
    const profile = await this.model.findById(PROFILE_ID).select(PROFILE_FIELDS).exec();
    return (profile ?? new this.model({ _id: PROFILE_ID })).toObject();
  }

  async update(dto: UpdateProfileDto) {
    const profile = await this.model
      .findByIdAndUpdate(
        PROFILE_ID,
        { $set: dto },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          projection: PROFILE_FIELDS,
        },
      )
      .exec();
    return profile.toObject();
  }

  /** Labels for the places on the profile that show this file. */
  async findMediaUsage(url: string): Promise<string[]> {
    const profile = await this.model
      .findById(PROFILE_ID, { avatarUrl: 1, resumeUrl: 1 })
      .lean()
      .exec();
    const usage: string[] = [];
    if (profile?.avatarUrl === url) usage.push('your profile photo');
    if (profile?.resumeUrl === url) usage.push('your CV');
    return usage;
  }
}
