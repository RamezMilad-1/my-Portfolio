import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export const PROJECT_STATUSES = ['draft', 'published'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

@Schema({ _id: false })
export class ProjectTeamLink {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TeamMember', required: true })
  memberId: Types.ObjectId;
}
const ProjectTeamLinkSchema = SchemaFactory.createForClass(ProjectTeamLink);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  tagline: string;

  @Prop({ default: '' })
  problem: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  architecture: string;

  @Prop({ default: '' })
  outcome: string;

  @Prop({ type: [String], default: [] })
  tech: string[];

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: '' })
  githubUrl: string;

  @Prop({ default: '' })
  liveUrl: string;

  @Prop({ default: '' })
  role: string;

  /** Card and detail-page cover. Falls back to the first image in `media`. */
  @Prop({ default: '' })
  coverImageUrl: string;

  @Prop({ type: [ProjectTeamLinkSchema], default: [] })
  team: ProjectTeamLink[];

  /** Ordered gallery; each item's caption lives on its Media document. */
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Media' }], default: [] })
  media: Types.ObjectId[];

  /** Featured projects are listed first on the public site. */
  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ enum: PROJECT_STATUSES, default: 'published' })
  status: ProjectStatus;

  @Prop({ default: 0 })
  position: number;

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ default: 'Live Demo' })
  liveLabel: string;

  @Prop({ default: 'Source' })
  sourceLabel: string;

  @Prop({ default: '' })
  category: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ status: 1, position: 1 });
