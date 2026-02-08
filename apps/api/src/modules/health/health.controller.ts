import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { DatabaseService } from '../../database/database.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private db: DatabaseService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      async () => {
        try {
            await this.db.$queryRaw`SELECT 1`;
            return {
                database: {
                    status: 'up',
                },
            };
        } catch (e) {
            return {
                database: {
                    status: 'down',
                    message: e.message,
                },
            };
        }
      }
    ]);
  }
}
