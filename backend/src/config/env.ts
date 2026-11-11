import { plainToInstance, Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsString, Max, Min, validateSync } from 'class-validator';

/** The value shipped in `.env.example`. It must never reach production. */
export const JWT_SECRET_PLACEHOLDER = 'change-me-to-a-long-random-string';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const SAME_SITE_VALUES = ['lax', 'strict', 'none'] as const;
export type SameSite = (typeof SAME_SITE_VALUES)[number];

const toInt = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

const toBoolean = ({ value }: TransformFnParams): unknown => value === true || value === 'true';

const toList = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : value;

/** Every environment variable the API reads, with its default and validation rule. */
export class Env {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Transform(toInt)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3001;

  @IsString()
  MONGO_URI = '';

  @IsString()
  JWT_SECRET = '';

  @IsString()
  COOKIE_NAME = 'ramez_session';

  @Transform(toBoolean)
  @IsBoolean()
  COOKIE_SECURE = false;

  @IsIn(SAME_SITE_VALUES)
  COOKIE_SAMESITE: SameSite = 'lax';

  /** Comma-separated browser origins allowed to call the API with credentials. */
  @Transform(toList)
  @IsString({ each: true })
  CORS_ORIGIN: string[] = ['http://localhost:3000'];

  /** Number of reverse proxies in front of the app (Express `trust proxy`). */
  @Transform(toInt)
  @IsInt()
  @Min(0)
  TRUST_PROXY = 1;

  /**
   * Request header that carries the visitor's real IP, set by the edge in front of the API.
   * Render sits behind Cloudflare, which always sets `cf-connecting-ip`. Empty = use `req.ip`.
   */
  @IsString()
  CLIENT_IP_HEADER = 'cf-connecting-ip';

  @IsString()
  CLOUDINARY_CLOUD_NAME = '';

  @IsString()
  CLOUDINARY_API_KEY = '';

  @IsString()
  CLOUDINARY_API_SECRET = '';
}

/** Parses and validates `process.env`; throws one readable error listing every problem. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw, { exposeDefaultValues: true });
  const problems = validateSync(env).flatMap((error) => Object.values(error.constraints ?? {}));

  if (!env.MONGO_URI) problems.push('MONGO_URI is required');
  if (!env.JWT_SECRET) problems.push('JWT_SECRET is required');
  if (!env.COOKIE_NAME) problems.push('COOKIE_NAME must not be empty');
  if (env.COOKIE_SAMESITE === 'none' && !env.COOKIE_SECURE) {
    problems.push('COOKIE_SAMESITE=none requires COOKIE_SECURE=true');
  }

  if (env.NODE_ENV === NodeEnv.Production) {
    if (env.JWT_SECRET === JWT_SECRET_PLACEHOLDER || env.JWT_SECRET.length < 32) {
      problems.push('JWT_SECRET must be a random value of at least 32 characters in production');
    }
    for (const key of [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ] as const) {
      if (!env[key]) problems.push(`${key} is required in production`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid environment configuration:\n  - ${problems.join('\n  - ')}`);
  }
  return env;
}
