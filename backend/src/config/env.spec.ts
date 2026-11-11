import { JWT_SECRET_PLACEHOLDER, validateEnv } from './env';

const base = { MONGO_URI: 'mongodb://localhost/test', JWT_SECRET: 'dev-secret' };
const production = {
  ...base,
  NODE_ENV: 'production',
  JWT_SECRET: 'x'.repeat(48),
  CLOUDINARY_CLOUD_NAME: 'cloud',
  CLOUDINARY_API_KEY: 'key',
  CLOUDINARY_API_SECRET: 'secret',
};

describe('validateEnv', () => {
  it('applies defaults and parses types', () => {
    const env = validateEnv({
      ...base,
      PORT: '4000',
      COOKIE_SECURE: 'false',
      CORS_ORIGIN: 'https://a.dev, https://b.dev',
    });
    expect(env.PORT).toBe(4000);
    expect(env.COOKIE_SECURE).toBe(false);
    expect(env.CORS_ORIGIN).toEqual(['https://a.dev', 'https://b.dev']);
    expect(env.COOKIE_NAME).toBe('ramez_session');
    expect(env.TRUST_PROXY).toBe(1);
  });

  it('requires a database and a JWT secret', () => {
    expect(() => validateEnv({})).toThrow(/MONGO_URI is required[\s\S]*JWT_SECRET is required/);
  });

  it('accepts a complete production config', () => {
    expect(() => validateEnv(production)).not.toThrow();
  });

  it('refuses weak secrets and missing Cloudinary keys in production', () => {
    expect(() => validateEnv({ ...production, JWT_SECRET: JWT_SECRET_PLACEHOLDER })).toThrow(
      /JWT_SECRET/,
    );
    expect(() => validateEnv({ ...production, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
    expect(() => validateEnv({ ...production, CLOUDINARY_API_SECRET: '' })).toThrow(
      /CLOUDINARY_API_SECRET/,
    );
  });

  it('refuses SameSite=None without Secure', () => {
    expect(() => validateEnv({ ...base, COOKIE_SAMESITE: 'none' })).toThrow(/COOKIE_SECURE/);
    expect(() =>
      validateEnv({ ...base, COOKIE_SAMESITE: 'none', COOKIE_SECURE: 'true' }),
    ).not.toThrow();
  });
});
