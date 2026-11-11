import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { Profile, ProfileSchema } from './profile.schema';
import { ProfileService } from './profile.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }])],
  controllers: [ProfileController],
  providers: [ProfileService],
  /** Used by Media to refuse deleting the profile photo or CV. */
  exports: [ProfileService],
})
export class ProfileModule {}
