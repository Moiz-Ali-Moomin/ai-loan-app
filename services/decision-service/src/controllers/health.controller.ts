import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, type HealthIndicatorResult } from '@nestjs/terminus';
import { DB_POOL_TOKEN } from '../repositories/decision.repository.js';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(DB_POOL_TOKEN) private readonly pool: import('@loan-platform/database').DatabasePool
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.pool.query('SELECT 1');
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
    ]);
  }

  @Get('metrics')
  metrics() {
    return '# decision-service metrics\n';
  }
}
