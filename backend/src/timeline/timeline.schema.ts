import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const TIMELINE_TYPES = ['education', 'work', 'achievement', 'personal'] as const;
export type TimelineType = (typeof TIMELINE_TYPES)[number];

@Schema({ timestamps: true, collection: 'timelineentries' })
export class TimelineEntry {
  /** Free text such as "May 2026". */
  @Prop({ required: true }) year: string;
  @Prop({ default: '' }) topic: string;
  @Prop({ required: true }) body: string;
  @Prop({ default: 'education', enum: TIMELINE_TYPES }) type: TimelineType;
  @Prop({ default: '' }) organization: string;
  /** Oldest first: the last published entry is shown as the latest milestone. */
  @Prop({ default: 0 }) position: number;
  @Prop({ default: true }) isPublished: boolean;
}

export const TimelineEntrySchema = SchemaFactory.createForClass(TimelineEntry);
TimelineEntrySchema.index({ isPublished: 1, position: 1 });
