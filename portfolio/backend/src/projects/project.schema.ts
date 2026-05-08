import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

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

  @Prop({ default: '' })
  coverImageUrl: string;

  @Prop({ type: [ProjectTeamLinkSchema], default: [] })
  team: ProjectTeamLink[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Media' }], default: [] })
  media: Types.ObjectId[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';

  @Prop({ default: 0 })
  position: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ status: 1, position: 1 });
