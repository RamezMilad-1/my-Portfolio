import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { OptionalHttpUrl, Trim } from '../../common/validators';

export class CreateTeamMemberDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @OptionalHttpUrl() githubUrl?: string;
  @OptionalHttpUrl() linkedinUrl?: string;
}

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {}
