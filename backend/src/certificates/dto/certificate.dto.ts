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
import { OptionalHttpUrl, OptionalText, Trim } from '../../common/validators';

export class CreateCertificateDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @OptionalText(120) issuer?: string;
  @OptionalText(60) issuedAt?: string;
  @OptionalText(2000) description?: string;
  @OptionalHttpUrl() credentialUrl?: string;
  @OptionalHttpUrl() imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
