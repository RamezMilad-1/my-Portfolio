import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

const PLACEHOLDER_JWT_SECRET = 'change-me-to-a-long-random-string';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const config = app.get(ConfigService);

  // Cap JSON bodies at 256kb (default would be 100kb).
  // File uploads route through Multer separately and are not affected.
  app.useBodyParser('json', { limit: '256kb' });
  app.useBodyParser('urlencoded', { limit: '256kb', extended: true });

  // ---- JWT secret runtime guard ----
  // Loud warning if the secret is missing or still the placeholder.
  // Don't crash — would block local dev — but make the problem impossible to miss.
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || secret === PLACEHOLDER_JWT_SECRET) {
    console.warn(
      '\n[SECURITY WARN] JWT_SECRET is missing or set to the example placeholder.',
    );
    console.warn(
      '[SECURITY WARN] Generate a real one before deploying:',
    );
    console.warn(
      '[SECURITY WARN]   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"',
    );
    console.warn(
      '[SECURITY WARN] Then set JWT_SECRET in your production env (NOT in the .env file in the repo).\n',
    );
  }

  // ---- Security middleware ----
  // helmet adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  // Strict-Transport-Security, and a basic Content-Security-Policy.
  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: true,
  });

  // Strip unknown fields from request bodies; reject if any are present.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Trust the first proxy so client IPs (used by ThrottlerGuard) are accurate
  // when running behind Vercel/Render/Railway/Nginx.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const port = Number(config.get('PORT', 3001));
  await app.listen(port);
  console.log(`[backend] listening on http://localhost:${port}/api/v1`);
}

bootstrap();
