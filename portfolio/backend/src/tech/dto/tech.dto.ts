import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTechItemDto {
  @IsString() name: string;

  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateTechItemDto extends PartialType(CreateTechItemDto) {}
