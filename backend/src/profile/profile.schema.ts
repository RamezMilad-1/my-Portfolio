import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** The profile is a single document with this id. */
export const PROFILE_ID = 'singleton';

@Schema({ _id: false })
export class AboutFocusBlock {
  @Prop({ default: '' }) heading: string;
  @Prop({ default: '' }) body: string;
}
const AboutFocusBlockSchema = SchemaFactory.createForClass(AboutFocusBlock);

/**
 * Everything personal on the public site. Every field is optional content: the site renders a
 * piece of UI only when its field has a value.
 */
@Schema({ timestamps: true, _id: false })
export class Profile {
  @Prop({ default: PROFILE_ID }) _id: string;

  @Prop({ default: '' }) displayName: string;
  @Prop({ default: '' }) logoInitial: string;
  @Prop({ default: '' }) headline: string;
  /** The first entry is the hero's big role headline. */
  @Prop({ type: [String], default: [] }) headlines: string[];
  @Prop({ default: '' }) bio: string;
  @Prop({ default: '' }) education: string;
  @Prop({ default: '' }) availability: string;
  @Prop({ default: '' }) email: string;
  @Prop({ default: '' }) avatarUrl: string;
  @Prop({ default: '' }) resumeUrl: string;
  @Prop({ type: Object, default: {} }) socials: Record<string, string>;

  // Section headings.
  @Prop({ default: '' }) aboutKicker: string;
  @Prop({ default: '' }) aboutTitle: string;
  @Prop({ default: '' }) aboutSubtitle: string;
  @Prop({ default: '' }) portfolioKicker: string;
  @Prop({ default: '' }) portfolioTitle: string;
  @Prop({ default: '' }) portfolioSubtitle: string;
  @Prop({ default: '' }) lifelineKicker: string;
  @Prop({ default: '' }) lifelineTitle: string;
  @Prop({ default: '' }) lifelineSubtitle: string;
  @Prop({ default: '' }) contactKicker: string;
  @Prop({ default: '' }) contactTitle: string;
  @Prop({ default: '' }) contactSubtitle: string;

  // About section content.
  @Prop({ default: '' }) aboutTagline: string;
  @Prop({ default: '' }) aboutLede: string;
  @Prop({ default: '' }) aboutFactLocation: string;
  @Prop({ default: '' }) aboutFactStack: string;
  @Prop({ default: '' }) aboutFactAvailable: string;
  @Prop({ default: '' }) aboutDividerLabel: string;
  @Prop({ type: [String], default: [] }) aboutCapabilities: string[];
  @Prop({ type: [AboutFocusBlockSchema], default: [] }) aboutFocusBlocks: AboutFocusBlock[];

  // Contact section.
  @Prop({ default: '' }) contactCTALabel: string;
  @Prop({ default: '' }) responseTime: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
