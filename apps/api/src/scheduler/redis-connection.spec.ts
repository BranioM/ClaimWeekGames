import { parseRedisConnection } from './redis-connection.js';

describe('parseRedisConnection', () => {
  it('uses local Redis defaults', () => {
    expect(parseRedisConnection()).toEqual({
      host: 'localhost',
      port: 6379,
      username: undefined,
      password: undefined,
      db: undefined,
      tls: undefined,
    });
  });

  it('parses configured Redis URLs', () => {
    expect(
      parseRedisConnection('redis://user:pass@redis.local:6380/2'),
    ).toEqual({
      host: 'redis.local',
      port: 6380,
      username: 'user',
      password: 'pass',
      db: 2,
      tls: undefined,
    });
  });

  it('enables TLS for rediss URLs', () => {
    expect(parseRedisConnection('rediss://redis.local:6380')).toEqual({
      host: 'redis.local',
      port: 6380,
      username: undefined,
      password: undefined,
      db: undefined,
      tls: {},
    });
  });
});
