import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTimelineEntryDto {
  @IsString() year: string;
  @IsString() body: string;

  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateTimelineEntryDto extends PartialType(
  CreateTimelineEntryDto,
) {}
