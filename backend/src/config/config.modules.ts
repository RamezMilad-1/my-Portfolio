import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv, type Env } from './env';

/** Typed accessor for the validated environment: `config.get('PORT', { infer: true })`. */
export type AppConfig = ConfigService<Env, true>;

/**
 * Loads `.env`, validates it once at startup, and makes `ConfigService` available everywhere.
 * Tests never read `.env`, so they can't accidentally point at a real database.
 */
export const AppConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvFile: process.env.NODE_ENV === 'test',
  validate: validateEnv,
});

export const DatabaseModule = MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: AppConfig) => ({ uri: config.get('MONGO_URI', { infer: true }) }),
});
