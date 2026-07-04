import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/health (GET)', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .get('/api/health')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          status?: unknown;
          database?: unknown;
          timestamp?: unknown;
        };

        expect(body).toMatchObject({
          status: 'ok',
          database: 'ok',
        });
        expect(typeof body.timestamp).toBe('string');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
