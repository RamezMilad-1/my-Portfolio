import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  // Accounts self-registered via /auth/register are plain users and cannot
  // sign in; promotion to 'admin' happens directly in the database
  // (Compass/Atlas) — never through the API.
  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: 'user' | 'admin';
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
