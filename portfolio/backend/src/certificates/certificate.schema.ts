import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CertificateDocument = HydratedDocument<Certificate>;

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ required: true }) title: string;

  @Prop({ default: '' }) issuer: string;

  @Prop({ default: '' }) issuedAt: string;

  @Prop({ default: '' }) credentialUrl: string;

  @Prop({ default: '' }) imageUrl: string;

  @Prop({ default: '' }) description: string;

  @Prop({ default: 0 }) position: number;

  @Prop({ default: true }) isPublished: boolean;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ isPublished: 1, position: 1 });
