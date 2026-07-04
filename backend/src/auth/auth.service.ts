import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly admins: AdminsService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const account = await this.admins.findByEmail(email);
    if (!account) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    // Only admins can hold a session. Self-registered accounts stay 'user'
    // until promoted directly in the database; the error is intentionally
    // identical so responses don't reveal which emails exist or their role.
    if (account.role !== 'admin')
      throw new UnauthorizedException('Invalid credentials');
    const token = await this.jwt.signAsync({
      sub: account._id.toString(),
      email: account.email,
    });
    return {
      token,
      admin: { id: account._id.toString(), email: account.email },
    };
  }

  async register(email: string, password: string) {
    const existing = await this.admins.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    try {
      await this.admins.create({ email, passwordHash, role: 'user' });
    } catch (err: unknown) {
      // Unique index race — same outcome as the pre-check above.
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
    return { ok: true };
  }
}
