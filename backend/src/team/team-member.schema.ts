import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) githubUrl: string;
  @Prop({ default: '' }) linkedinUrl: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
