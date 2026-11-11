/**
 * Creates an admin account, or resets the password of an existing one.
 *
 *   npm run create-admin -- --email you@example.com
 *
 * Connects to the database in MONGO_URI (read from backend/.env like the API itself) and asks
 * for the password without echoing it. For non-interactive use, set ADMIN_PASSWORD instead.
 */
import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { parseArgs } from 'node:util';
import { AdminsModule } from '../admins/admins.module';
import { AdminsService } from '../admins/admins.service';
import { BCRYPT_ROUNDS, PASSWORD_MAX_BYTES } from '../auth/auth.constants';
import { AppConfigModule, DatabaseModule } from '../config/config.modules';

const PASSWORD_MIN_LENGTH = 12;

@Module({ imports: [AppConfigModule, DatabaseModule, AdminsModule] })
class CreateAdminModule {}

/** Reads one line from the terminal without echoing it. */
function promptHidden(question: string): Promise<string> {
  const { stdin, stdout } = process;
  if (!stdin.isTTY) {
    return Promise.reject(new Error('No terminal to prompt in — set ADMIN_PASSWORD instead.'));
  }
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error?: Error) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n' || char === '\u0004') return finish();
        if (char === '\u0003') return finish(new Error('Cancelled'));
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else value += char;
      }
    };
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', onData);
  });
}

async function readPassword(): Promise<string> {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv !== undefined) return fromEnv;
  const password = await promptHidden(
    `New password (at least ${PASSWORD_MIN_LENGTH} characters): `,
  );
  const repeated = await promptHidden('Repeat the password: ');
  if (password !== repeated) throw new Error('The passwords do not match.');
  return password;
}

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { email: { type: 'string' } } });
  const email = values.email?.trim().toLowerCase();
  if (!email || !isEmail(email)) {
    throw new Error('Usage: npm run create-admin -- --email you@example.com');
  }

  const password = await readPassword();
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`The password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
    throw new Error(`The password must be at most ${PASSWORD_MAX_BYTES} bytes.`);
  }

  const app = await NestFactory.createApplicationContext(CreateAdminModule, {
    logger: ['error', 'warn'],
  });
  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = await app.get(AdminsService).upsertAdmin(email, passwordHash);
    console.log(
      result === 'created'
        ? `Created admin account ${email}.`
        : `Updated the password of ${email} and made sure it has the admin role.`,
    );
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
