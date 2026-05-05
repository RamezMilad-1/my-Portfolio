import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTeamMemberDto {
  @IsString() name: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {}
