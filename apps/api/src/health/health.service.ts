import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type HealthStatus = {
  status: 'ok';
  database: 'ok';
  timestamp: string;
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthStatus> {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
