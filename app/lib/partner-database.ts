import type { PoolConfig } from 'pg';

/** Keep URL SSL switches from replacing pg's verified TLS configuration. */
export function partnerDatabaseOptions(connectionString: string, certificate = process.env.PARTNER_INQUIRY_DATABASE_CA): PoolConfig {
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid partner database configuration.');
  const localTest = process.env.NODE_ENV !== 'production'
    && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    && !url.searchParams.has('host');
  for (const key of ['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: localTest ? false : { rejectUnauthorized: true, ...(certificate?.trim() ? { ca: certificate.trim() } : {}) },
    max: 2,
    connectionTimeoutMillis: 3000,
    query_timeout: 5000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true,
  };
}
