import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';
import { DUMMY_PASSWORD_HASH } from './auth.constants';
import type { AuthenticatedAdmin, SessionPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly admins: AdminsService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Unknown email, wrong password and non-admin account all cost one bcrypt comparison and
   * return the same error, so the response never reveals which emails have accounts.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; admin: AuthenticatedAdmin }> {
    const account = await this.admins.findByEmail(email);
    const passwordMatches = await bcrypt.compare(
      password,
      account?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!account || !passwordMatches || account.role !== 'admin') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const admin: AuthenticatedAdmin = { id: account._id.toString(), email: account.email };
    const payload: SessionPayload = { sub: admin.id, email: admin.email };
    return { token: await this.jwt.signAsync(payload), admin };
  }
}
