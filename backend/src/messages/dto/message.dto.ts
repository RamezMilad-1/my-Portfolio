import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/validators';

export class CreateMessageDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Trim()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  body: string;

  /**
   * Honeypot: a field people never see or fill in. Bots that fill it get a normal-looking
   * response, but nothing is stored.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fax?: string;
}

export class UpdateMessageDto {
  @IsBoolean()
  read: boolean;
}
