import { Client } from 'pg';
import { partnerDatabaseOptions } from '@/app/lib/partner-database';

// Exercise pg's effective settings: URL parameters can otherwise override ssl.
function effectiveSsl(url: string, certificate?: string) {
  const client = new Client(partnerDatabaseOptions(url, certificate));
  return (client as unknown as { connectionParameters: { ssl: unknown } }).connectionParameters.ssl;
}

it.each(['', '?sslmode=disable', '?ssl=no-verify', '?sslmode=require&uselibpqcompat=true'])('requires verified TLS for a remote database: %s', query => {
  expect(effectiveSsl(`postgres://fixture:synthetic@db.example.test/postgres${query}`)).toEqual({ rejectUnauthorized: true });
});

it('keeps the reviewed CA when URL SSL settings are present', () => {
  expect(effectiveSsl('postgres://fixture:synthetic@db.example.test/postgres?sslmode=require&sslrootcert=/not-a-file', ' synthetic-reviewed-ca\n'))
    .toEqual({ rejectUnauthorized: true, ca: 'synthetic-reviewed-ca' });
});

it('allows the isolated non-production loopback database', () => {
  expect(effectiveSsl('postgres://127.0.0.1:55439/ofroot_partner_test')).toBe(false);
});

it('requires verified TLS even for loopback when running in production', () => {
  const environment = jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'production' });
  try {
    expect(effectiveSsl('postgres://127.0.0.1/postgres?sslmode=disable')).toEqual({ rejectUnauthorized: true });
  } finally { environment.restore(); }
});

it('does not treat a URL host override as a local test database', () => {
  expect(effectiveSsl('postgres://127.0.0.1/postgres?host=db.example.test&sslmode=disable')).toEqual({ rejectUnauthorized: true });
});

it('rejects non-Postgres connection URLs', () => {
  expect(() => partnerDatabaseOptions('https://example.test')).toThrow('Invalid partner database configuration.');
});
