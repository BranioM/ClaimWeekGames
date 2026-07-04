import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const internalApiKey = 'e2e-internal-key';

  beforeEach(async () => {
    process.env.INTERNAL_API_KEY = internalApiKey;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        freeGameOffer: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'offer-1',
              externalOfferId: 'external-offer-1',
              startDate: new Date('2026-07-01T00:00:00.000Z'),
              endDate: new Date('2026-07-08T00:00:00.000Z'),
              detectedAt: new Date('2026-07-04T00:00:00.000Z'),
              game: {
                id: 'game-1',
                title: 'Example Game',
                slug: 'example-game',
                developer: null,
                publisher: 'Example Publisher',
              },
              store: {
                id: 'store-1',
                name: 'Epic Games Store',
              },
            },
          ]),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'user-1',
            email: 'user@example.com',
          }),
        },
        userSession: {
          create: jest.fn().mockResolvedValue({}),
          findUnique: jest.fn().mockResolvedValue({
            id: 'session-1',
            expiresAt: new Date(Date.now() + 60_000),
            revokedAt: null,
            user: {
              id: 'user-1',
              email: 'user@example.com',
            },
          }),
          update: jest.fn().mockResolvedValue({}),
        },
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

  it('/api/free-offers (GET)', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .get('/api/free-offers')
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([
          {
            id: 'offer-1',
            externalOfferId: 'external-offer-1',
            startDate: '2026-07-01T00:00:00.000Z',
            endDate: '2026-07-08T00:00:00.000Z',
            detectedAt: '2026-07-04T00:00:00.000Z',
            game: {
              id: 'game-1',
              title: 'Example Game',
              slug: 'example-game',
              publisher: 'Example Publisher',
            },
            store: {
              id: 'store-1',
              name: 'Epic Games Store',
            },
          },
        ]);
      });
  });

  it('/api/me (GET) rejects missing bearer token', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server).get('/api/me').expect(401);
  });

  it('/api/me (GET) returns the authenticated user', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .get('/api/me')
      .set('authorization', 'Bearer valid-session-token')
      .expect(200)
      .expect({
        user: {
          id: 'user-1',
          email: 'user@example.com',
        },
      });
  });

  it('/api/internal/auth/sessions (POST) rejects missing internal API key', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .post('/api/internal/auth/sessions')
      .send({ userId: 'user-1' })
      .expect(401);
  });

  it('/api/internal/auth/sessions (POST) creates a session with internal API key', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .post('/api/internal/auth/sessions')
      .set('x-api-key', internalApiKey)
      .send({ userId: 'user-1' })
      .expect(201)
      .expect((response) => {
        const body = response.body as {
          token?: unknown;
          expiresAt?: unknown;
          user?: unknown;
        };

        expect(typeof body.token).toBe('string');
        expect(typeof body.expiresAt).toBe('string');
        expect(body.user).toEqual({
          id: 'user-1',
          email: 'user@example.com',
        });
      });
  });

  it('/api/internal/epic/accounts/connection-state (POST) rejects missing internal API key', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .post('/api/internal/epic/accounts/connection-state')
      .send({ userId: 'user-1' })
      .expect(401);
  });

  it('/api/internal/epic/sync/free-offers (POST) rejects missing internal API key', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    return request(server)
      .post('/api/internal/epic/sync/free-offers')
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
    delete process.env.INTERNAL_API_KEY;
  });
});
