import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

const PLACEHOLDER_JWT_SECRET = 'change-me-to-a-long-random-string';
const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const config = app.get(ConfigService);

  app.useBodyParser('json', { limit: '256kb' });
  app.useBodyParser('urlencoded', { limit: '256kb', extended: true });

  const secret = config.get<string>('JWT_SECRET');
  if (!secret || secret === PLACEHOLDER_JWT_SECRET) {
    logger.warn('JWT_SECRET is missing or set to the example placeholder.');
    logger.warn('Generate a real secret before deploying.');
    logger.warn(
      'Use: node -e "process.stdout.write(require(\'crypto\').randomBytes(48).toString(\'base64\'))"',
    );
    logger.warn('Set JWT_SECRET in the production environment.');
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const port = Number(config.get('PORT', 3001));
  await app.listen(port);
  logger.log(`Listening on http://localhost:${port}/api/v1`);
}

bootstrap();
