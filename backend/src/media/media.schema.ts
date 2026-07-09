import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ timestamps: true })
export class Media {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project' })
  projectId?: Types.ObjectId;

  @Prop({ enum: ['image', 'video', 'raw'], required: true })
  kind: 'image' | 'video' | 'raw';

  @Prop({ required: true }) storagePath: string;
  @Prop({ required: true }) url: string;
  @Prop({ default: '' }) caption: string;
  @Prop({ default: 0 }) position: number;
  @Prop({ default: 0 }) sizeBytes: number;
  @Prop({ default: '' }) originalName: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
