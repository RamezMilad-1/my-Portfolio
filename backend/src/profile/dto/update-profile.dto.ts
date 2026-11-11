import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, ValidateNested } from 'class-validator';
import {
  OptionalEmail,
  OptionalHttpUrl,
  OptionalStringList,
  OptionalText,
} from '../../common/validators';

export class SocialsDto {
  @OptionalHttpUrl() github?: string;
  @OptionalHttpUrl() linkedin?: string;
  @OptionalHttpUrl() x?: string;
  @OptionalHttpUrl() website?: string;
}

export class AboutFocusBlockDto {
  @OptionalText(120) heading?: string;
  @OptionalText(600) body?: string;
}

export class UpdateProfileDto {
  @OptionalText(80) displayName?: string;
  @OptionalText(3) logoInitial?: string;
  @OptionalText(300) headline?: string;
  @OptionalStringList(10, 120) headlines?: string[];
  @OptionalText(8000) bio?: string;
  @OptionalText(200) education?: string;
  @OptionalText(120) availability?: string;
  @OptionalEmail() email?: string;
  @OptionalHttpUrl() avatarUrl?: string;
  @OptionalHttpUrl() resumeUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialsDto)
  socials?: SocialsDto;

  @OptionalText(80) aboutKicker?: string;
  @OptionalText(160) aboutTitle?: string;
  @OptionalText(400) aboutSubtitle?: string;
  @OptionalText(80) portfolioKicker?: string;
  @OptionalText(160) portfolioTitle?: string;
  @OptionalText(400) portfolioSubtitle?: string;
  @OptionalText(80) lifelineKicker?: string;
  @OptionalText(160) lifelineTitle?: string;
  @OptionalText(400) lifelineSubtitle?: string;
  @OptionalText(80) contactKicker?: string;
  @OptionalText(160) contactTitle?: string;
  @OptionalText(400) contactSubtitle?: string;

  @OptionalText(160) aboutTagline?: string;
  @OptionalText(600) aboutLede?: string;
  @OptionalText(160) aboutFactLocation?: string;
  @OptionalText(160) aboutFactStack?: string;
  @OptionalText(160) aboutFactAvailable?: string;
  @OptionalText(80) aboutDividerLabel?: string;
  @OptionalStringList(20, 400) aboutCapabilities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => AboutFocusBlockDto)
  aboutFocusBlocks?: AboutFocusBlockDto[];

  @OptionalText(60) contactCTALabel?: string;
  @OptionalText(120) responseTime?: string;
}
