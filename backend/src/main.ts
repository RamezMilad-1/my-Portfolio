import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { API_PREFIX, configureApp } from './app.setup';
import type { Env } from './config/env';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  configureApp(app);
  app.enableShutdownHooks();

  const port = app.get<ConfigService<Env, true>>(ConfigService).get('PORT', { infer: true });
  await app.listen(port);
  logger.log(`API listening on port ${port} under /${API_PREFIX}`);
}

bootstrap().catch((error: unknown) => {
  logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
