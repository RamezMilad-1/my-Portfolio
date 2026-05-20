import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ _id: false })
export class ProfileStats {
  @Prop({ type: Number }) yearsCoding?: number;
  @Prop({ type: Number }) projectsShipped?: number;
  @Prop({ type: Number }) technologies?: number;
}
const ProfileStatsSchema = SchemaFactory.createForClass(ProfileStats);

@Schema({ timestamps: true, _id: false })
export class Profile {
  @Prop({ default: 'singleton' }) _id: string;

  @Prop({ required: true }) displayName: string;
  @Prop({ required: true }) headline: string;
  @Prop({ default: '' }) bio: string;
  @Prop({ default: '' }) education: string;
  @Prop({ default: '' }) availability: string;
  @Prop({ default: '' }) email: string;
  @Prop({ default: '' }) avatarUrl: string;
  @Prop({ default: '' }) resumeUrl: string;

  @Prop({ type: Object, default: {} }) socials: Record<string, string>;

  @Prop({ type: [String], default: [] }) headlines: string[];

  @Prop({ type: ProfileStatsSchema, default: () => ({}) }) stats: ProfileStats;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
