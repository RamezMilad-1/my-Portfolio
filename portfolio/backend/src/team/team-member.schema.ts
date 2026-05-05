import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeamMemberDocument = HydratedDocument<TeamMember>;

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) role: string;
  @Prop({ default: '' }) githubUrl: string;
  @Prop({ default: '' }) linkedinUrl: string;
  @Prop({ default: '' }) avatarUrl: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
