import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const ADMIN_ROLES = ['user', 'admin'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  /**
   * Only `admin` accounts can sign in. Admins are created with `npm run create-admin`;
   * `user` remains valid for accounts created by the old self-registration page.
   */
  @Prop({ default: 'user', enum: ADMIN_ROLES })
  role: AdminRole;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
