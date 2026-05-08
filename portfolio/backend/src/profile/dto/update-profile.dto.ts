import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() headline?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() education?: string;
  @IsOptional() @IsString() availability?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() resumeUrl?: string;

  @IsOptional() @IsObject() socials?: Record<string, string>;
}
