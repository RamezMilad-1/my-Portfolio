import 'dotenv/config';
import 'reflect-metadata';
import mongoose from 'mongoose';
import * as readline from 'readline/promises';
import { stdin, stdout } from 'process';
import * as bcrypt from 'bcrypt';
import { AdminSchema } from '../src/admins/admin.schema';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/ramez_portfolio';

async function ask(rl: readline.Interface, q: string, hide = false): Promise<string> {
  if (!hide) return (await rl.question(q)).trim();

  // simple "hide" by clearing the line — not perfectly secure but no extra deps
  process.stdout.write(q);
  return await new Promise<string>((resolve) => {
    let buf = '';
    const onData = (chunk: Buffer) => {
      const s = chunk.toString();
      for (const ch of s) {
        if (ch === '\r' || ch === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          return resolve(buf.trim());
        } else if (ch === '') {
          process.exit(1);
        } else if (ch === '' || ch === '\b') {
          buf = buf.slice(0, -1);
          process.stdout.write('\b \b');
        } else {
          buf += ch;
          process.stdout.write('*');
        }
      }
    };
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

async function run() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  const email = (await ask(rl, 'Admin email: ')).toLowerCase();
  if (!email.includes('@')) {
    console.error('Invalid email.');
    rl.close();
    process.exit(1);
  }
  const password = await ask(rl, 'Admin password (min 8 chars): ', true);
  if (password.length < 8) {
    console.error('Password too short.');
    rl.close();
    process.exit(1);
  }
  const confirm = await ask(rl, 'Confirm password: ', true);
  if (password !== confirm) {
    console.error('Passwords do not match.');
    rl.close();
    process.exit(1);
  }
  rl.close();

  console.log(`[create-admin] connecting to ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  const Admin = mongoose.model('Admin', AdminSchema);

  const existing = await Admin.findOne({ email }).exec();
  const passwordHash = await bcrypt.hash(password, 12);
  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`[create-admin] updated password for ${email}`);
  } else {
    await Admin.create({ email, passwordHash });
    console.log(`[create-admin] created admin ${email}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
