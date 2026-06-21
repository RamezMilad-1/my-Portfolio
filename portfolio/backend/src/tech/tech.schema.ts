import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TechItemDocument = HydratedDocument<TechItem>;

@Schema({ timestamps: true, collection: 'techitems' })
export class TechItem {
  @Prop({ required: true }) name: string;

  @Prop({ default: '' }) category: string;

  @Prop({ default: 0 }) position: number;

  @Prop({ default: true }) isPublished: boolean;
}

export const TechItemSchema = SchemaFactory.createForClass(TechItem);
TechItemSchema.index({ isPublished: 1, position: 1 });
