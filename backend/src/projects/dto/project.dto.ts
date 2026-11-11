import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNotIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OptionalHttpUrl, OptionalStringList, OptionalText, Trim } from '../../common/validators';
import { PROJECT_STATUSES, type ProjectStatus } from '../project.schema';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `GET /projects/all` is the admin list, so no project may use that slug. */
const RESERVED_SLUGS = ['all'];

export class TeamLinkDto {
  @IsMongoId()
  memberId: string;
}

export class CreateProjectDto {
  @Trim()
  @IsString()
  @MaxLength(80)
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase letters, digits and single dashes' })
  @IsNotIn(RESERVED_SLUGS, { message: 'that slug is reserved — pick another one' })
  slug: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @OptionalText(300) tagline?: string;
  @OptionalText(2000) problem?: string;
  @OptionalText(20000) description?: string;
  @OptionalText(20000) architecture?: string;
  @OptionalText(2000) outcome?: string;
  @OptionalText(120) role?: string;
  @OptionalText(60) category?: string;
  @OptionalText(40) liveLabel?: string;
  @OptionalText(40) sourceLabel?: string;

  @OptionalHttpUrl() githubUrl?: string;
  @OptionalHttpUrl() liveUrl?: string;
  @OptionalHttpUrl() coverImageUrl?: string;

  @OptionalStringList(50, 60) tech?: string[];
  @OptionalStringList(50, 300) features?: string[];
  @OptionalStringList(50, 300) highlights?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => TeamLinkDto)
  team?: TeamLinkDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  media?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: ProjectStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ReorderItemDto {
  @IsMongoId()
  id: string;

  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderProjectsDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
