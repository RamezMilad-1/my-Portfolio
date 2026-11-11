import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { MEDIA_KINDS, type MediaKind } from './media.constants';

@Schema({ timestamps: true })
export class Media {
  /** The project the file was uploaded for, if any. */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project' })
  projectId?: Types.ObjectId;

  @Prop({ enum: MEDIA_KINDS, required: true })
  kind: MediaKind;

  /** Cloudinary public id — the handle used to delete the asset. */
  @Prop({ required: true })
  storagePath: string;

  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  caption: string;

  @Prop({ default: 0 })
  sizeBytes: number;

  @Prop({ default: '' })
  originalName: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
