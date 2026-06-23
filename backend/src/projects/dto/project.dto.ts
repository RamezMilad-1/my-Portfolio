import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class TeamLinkDto {
  @IsString() memberId: string;
}

export class CreateProjectDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, digits, and dashes only',
  })
  slug: string;

  @IsString() name: string;

  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() problem?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() architecture?: string;
  @IsOptional() @IsString() outcome?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tech?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TeamLinkDto)
  team?: TeamLinkDto[];
  @IsOptional() @IsArray() @IsString({ each: true }) media?: string[];
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsEnum(['draft', 'published']) status?: 'draft' | 'published';
  @IsOptional() @IsInt() position?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) gallery?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) highlights?: string[];
  @IsOptional() @IsString() liveLabel?: string;
  @IsOptional() @IsString() sourceLabel?: string;
  @IsOptional() @IsString() category?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ReorderItemDto {
  @IsString() id: string;
  @IsInt() position: number;
}

export class ReorderProjectsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
