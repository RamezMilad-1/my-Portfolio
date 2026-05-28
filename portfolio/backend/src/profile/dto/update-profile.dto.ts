import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProfileStatsDto {
  @IsOptional() @IsInt() @Min(0) yearsCoding?: number;
  @IsOptional() @IsInt() @Min(0) projectsShipped?: number;
  @IsOptional() @IsInt() @Min(0) technologies?: number;
}

export class AboutFocusBlockDto {
  @IsOptional() @IsString() heading?: string;
  @IsOptional() @IsString() body?: string;
}

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

  @IsOptional() @IsArray() @IsString({ each: true }) headlines?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileStatsDto)
  stats?: ProfileStatsDto;

  @IsOptional() @IsString() aboutKicker?: string;
  @IsOptional() @IsString() aboutTitle?: string;
  @IsOptional() @IsString() aboutSubtitle?: string;

  @IsOptional() @IsString() portfolioKicker?: string;
  @IsOptional() @IsString() portfolioTitle?: string;
  @IsOptional() @IsString() portfolioSubtitle?: string;

  @IsOptional() @IsString() contactKicker?: string;
  @IsOptional() @IsString() contactTitle?: string;
  @IsOptional() @IsString() contactSubtitle?: string;

  @IsOptional() @IsString() lifelineKicker?: string;
  @IsOptional() @IsString() lifelineTitle?: string;
  @IsOptional() @IsString() lifelineSubtitle?: string;

  @IsOptional() @IsString() aboutTagline?: string;
  @IsOptional() @IsString() aboutLede?: string;
  @IsOptional() @IsString() aboutFactLocation?: string;
  @IsOptional() @IsString() aboutFactStack?: string;
  @IsOptional() @IsString() aboutFactAvailable?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aboutCapabilities?: string[];

  @IsOptional() @IsString() aboutFocusKicker?: string;
  @IsOptional() @IsString() aboutFocusTitle?: string;
  @IsOptional() @IsString() aboutFocusSubtitle?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutFocusBlockDto)
  aboutFocusBlocks?: AboutFocusBlockDto[];
}
