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

@Schema({ _id: false })
export class AboutFocusBlock {
  @Prop({ default: '' }) heading?: string;
  @Prop({ default: '' }) body?: string;
}
const AboutFocusBlockSchema = SchemaFactory.createForClass(AboutFocusBlock);

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

  // Editable copy for the public section headers. Blank = use site default.
  @Prop({ default: '' }) aboutKicker: string;
  @Prop({ default: '' }) aboutTitle: string;
  @Prop({ default: '' }) aboutSubtitle: string;

  @Prop({ default: '' }) portfolioKicker: string;
  @Prop({ default: '' }) portfolioTitle: string;
  @Prop({ default: '' }) portfolioSubtitle: string;

  @Prop({ default: '' }) contactKicker: string;
  @Prop({ default: '' }) contactTitle: string;
  @Prop({ default: '' }) contactSubtitle: string;

  @Prop({ default: '' }) lifelineKicker: string;
  @Prop({ default: '' }) lifelineTitle: string;
  @Prop({ default: '' }) lifelineSubtitle: string;

  // Editable copy for the public About section content. Blank = use site default.
  @Prop({ default: '' }) aboutTagline: string;
  @Prop({ default: '' }) aboutLede: string;
  @Prop({ default: '' }) aboutFactLocation: string;
  @Prop({ default: '' }) aboutFactStack: string;
  @Prop({ default: '' }) aboutFactAvailable: string;
  @Prop({ type: [String], default: [] }) aboutCapabilities: string[];
  @Prop({ default: '' }) aboutFocusKicker: string;
  @Prop({ default: '' }) aboutFocusTitle: string;
  @Prop({ default: '' }) aboutFocusSubtitle: string;
  @Prop({ type: [AboutFocusBlockSchema], default: [] })
  aboutFocusBlocks: AboutFocusBlock[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
