import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkillItemDto {
  @IsString() name: string;
  @IsOptional() @IsString() level?: string;
}

export class SkillCategoryDto {
  @IsString() category: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SkillItemDto)
  items: SkillItemDto[];
}

export class TimelineEntryDto {
  @IsString() year: string;
  @IsString() title: string;
  @IsOptional() @IsString() body?: string;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() headline?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() resumeUrl?: string;

  @IsOptional() @IsObject() socials?: Record<string, string>;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SkillCategoryDto)
  skills?: SkillCategoryDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TimelineEntryDto)
  timeline?: TimelineEntryDto[];
}
