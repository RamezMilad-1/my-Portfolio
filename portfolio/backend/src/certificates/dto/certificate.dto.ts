import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCertificateDto {
  @IsString() title: string;

  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsString() issuedAt?: string;
  @IsOptional() @IsString() credentialUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
