import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';

/** Liveness probe for the uptime pinger: answers instantly and never touches the database. */
@Controller('health')
export class HealthController {
  @Public()
  @SkipThrottle()
  @Get()
  check() {
    return { ok: true };
  }
}
