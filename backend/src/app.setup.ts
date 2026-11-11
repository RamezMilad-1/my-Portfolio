import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Env } from './config/env';

export const API_PREFIX = 'api/v1';

/** HTTP-level setup shared by `main.ts` and the end-to-end tests. */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.set('trust proxy', config.get('TRUST_PROXY', { infer: true }));
  app.useBodyParser('json', { limit: '256kb' });
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }), credentials: true });
}
