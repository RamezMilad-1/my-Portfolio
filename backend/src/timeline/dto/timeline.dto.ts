import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { OptionalText, Trim } from '../../common/validators';
import { TIMELINE_TYPES, type TimelineType } from '../timeline.schema';

export class CreateTimelineEntryDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  year: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;

  @OptionalText(120) topic?: string;
  @OptionalText(120) organization?: string;

  @IsOptional()
  @IsIn(TIMELINE_TYPES)
  type?: TimelineType;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateTimelineEntryDto extends PartialType(CreateTimelineEntryDto) {}
