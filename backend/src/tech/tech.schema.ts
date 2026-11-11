import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'techitems' })
export class TechItem {
  /** Brand name; the public grid picks the logo from it. */
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) category: string;
  @Prop({ default: 0 }) position: number;
  @Prop({ default: true }) isPublished: boolean;
}

export const TechItemSchema = SchemaFactory.createForClass(TechItem);
TechItemSchema.index({ isPublished: 1, position: 1 });
