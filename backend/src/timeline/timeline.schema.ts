import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TimelineEntryDocument = HydratedDocument<TimelineEntry>;

@Schema({ timestamps: true, collection: 'timelineentries' })
export class TimelineEntry {
  @Prop({ required: true }) year: string;

  @Prop({ default: '' }) topic: string;

  @Prop({ required: true }) body: string;

  @Prop({ default: 'education', enum: ['education', 'work', 'achievement', 'personal'] })
  type: string;

  @Prop({ default: '' }) organization: string;

  @Prop({ default: 0 }) position: number;

  @Prop({ default: true }) isPublished: boolean;
}

export const TimelineEntrySchema = SchemaFactory.createForClass(TimelineEntry);
TimelineEntrySchema.index({ isPublished: 1, position: 1 });
