import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/** Trims surrounding whitespace from string input; leaves other types for the validators to reject. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value));

/** Optional free text: trimmed, bounded. */
export const OptionalText = (maxLength: number) =>
  applyDecorators(IsOptional(), Trim(), IsString(), MaxLength(maxLength));

/** Optional list of short strings: each item trimmed, blank items dropped, size and length bounded. */
export const OptionalStringList = (maxItems: number, maxLength: number) =>
  applyDecorators(
    IsOptional(),
    Transform(({ value }: { value: unknown }) =>
      Array.isArray(value)
        ? value
            .map((item: unknown) => (typeof item === 'string' ? item.trim() : item))
            .filter((item) => item !== '')
        : value,
    ),
    IsArray(),
    ArrayMaxSize(maxItems),
    IsString({ each: true }),
    MaxLength(maxLength, { each: true }),
  );

/**
 * Optional http(s) URL. An empty string is allowed and means "not set", which is how the admin
 * forms send cleared fields. Anything else must be a real absolute http(s) URL, so values such as
 * `javascript:` can never be stored and rendered as links.
 */
export const OptionalHttpUrl = () =>
  applyDecorators(
    IsOptional(),
    Trim(),
    IsString(),
    MaxLength(2048),
    ValidateIf((_object, value) => value !== ''),
    IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }),
  );

/** Optional email address; an empty string means "not set". */
export const OptionalEmail = () =>
  applyDecorators(
    IsOptional(),
    Trim(),
    IsString(),
    MaxLength(254),
    ValidateIf((_object, value) => value !== ''),
    IsEmail(),
  );
