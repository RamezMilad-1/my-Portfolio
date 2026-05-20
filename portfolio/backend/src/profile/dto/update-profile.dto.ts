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
}
