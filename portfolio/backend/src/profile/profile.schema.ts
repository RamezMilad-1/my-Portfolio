import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ _id: false })
export class SkillItem {
  @Prop({ required: true }) name: string;
  @Prop() level?: string;
}
const SkillItemSchema = SchemaFactory.createForClass(SkillItem);

@Schema({ _id: false })
export class SkillCategory {
  @Prop({ required: true }) category: string;
  @Prop({ type: [SkillItemSchema], default: [] }) items: SkillItem[];
}
const SkillCategorySchema = SchemaFactory.createForClass(SkillCategory);

@Schema({ _id: false })
export class TimelineEntry {
  @Prop({ required: true }) year: string;
  @Prop({ required: true }) title: string;
  @Prop() body?: string;
}
const TimelineEntrySchema = SchemaFactory.createForClass(TimelineEntry);

@Schema({ timestamps: true, _id: false })
export class Profile {
  @Prop({ default: 'singleton' }) _id: string;

  @Prop({ required: true }) displayName: string;
  @Prop({ required: true }) headline: string;
  @Prop({ default: '' }) bio: string;
  @Prop({ default: '' }) email: string;
  @Prop({ default: '' }) avatarUrl: string;
  @Prop({ default: '' }) resumeUrl: string;

  @Prop({ type: Object, default: {} }) socials: Record<string, string>;

  @Prop({ type: [SkillCategorySchema], default: [] }) skills: SkillCategory[];
  @Prop({ type: [TimelineEntrySchema], default: [] }) timeline: TimelineEntry[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
