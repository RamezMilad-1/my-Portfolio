import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) body: string;
  @Prop({ default: false }) read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
