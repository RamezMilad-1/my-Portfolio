import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { OptionalText, Trim } from '../../common/validators';

export class CreateTechItemDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @OptionalText(60) category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateTechItemDto extends PartialType(CreateTechItemDto) {}
