import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AppConfig } from '../config/config.modules';

/**
 * Rate-limits per caller rather than per load balancer. Render sits behind Cloudflare, so the
 * socket address is a proxy's; Cloudflare's `cf-connecting-ip` is the address that connected to
 * it and can't be forged. Requests proxied by the Vercel site arrive from Vercel's edge, so those
 * share a bucket per edge address — ample for this site's traffic, and unlike `x-forwarded-for`
 * it can't be spoofed by calling the API directly. `req.ip` is the local fallback.
 */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  @Inject(ConfigService)
  private readonly config: AppConfig;

  protected override getTracker(req: Request): Promise<string> {
    const header = this.config.get('CLIENT_IP_HEADER', { infer: true }).toLowerCase();
    const raw = header ? req.headers[header] : undefined;
    const fromHeader = (Array.isArray(raw) ? raw[0] : raw)?.split(',')[0]?.trim();
    return Promise.resolve(fromHeader || req.ip || 'unknown');
  }
}
