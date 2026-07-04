export type RedisConnectionOptions = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db?: number;
  tls?: Record<string, never>;
};

export function parseRedisConnection(
  redisUrl = 'redis://localhost:6379',
): RedisConnectionOptions {
  const url = new URL(redisUrl);

  if (url.protocol !== 'redis:' && url.protocol !== 'rediss:') {
    throw new Error('REDIS_URL must use the redis:// or rediss:// protocol');
  }

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: decodeOptionalValue(url.username),
    password: decodeOptionalValue(url.password),
    db: parseDatabaseNumber(url.pathname),
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
}

function decodeOptionalValue(value: string): string | undefined {
  return value ? decodeURIComponent(value) : undefined;
}

function parseDatabaseNumber(pathname: string): number | undefined {
  const rawDatabase = pathname.replace('/', '');

  if (!rawDatabase) {
    return undefined;
  }

  const database = Number(rawDatabase);

  if (!Number.isInteger(database) || database < 0) {
    throw new Error('REDIS_URL database path must be a non-negative integer');
  }

  return database;
}
