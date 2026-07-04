import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  let controller: HealthController;

  const healthResponse = {
    status: 'ok' as const,
    database: 'ok' as const,
    timestamp: '2026-07-04T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getHealth: jest.fn().mockResolvedValue(healthResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns the health status', async () => {
    await expect(controller.getHealth()).resolves.toEqual(healthResponse);
  });
});
