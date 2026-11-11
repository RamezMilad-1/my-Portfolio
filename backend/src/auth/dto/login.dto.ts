import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;

  /** No length policy here: sign-in must accept any password that was valid when it was set. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
