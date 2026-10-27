// Deterministic production-path verification: no real database or network calls.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const originalResolve = Module._resolveFilename;
const originalLoad = Module._load;
Module._resolveFilename = function (name, ...args) { return originalResolve.call(this, name.startsWith('@/') ? path.join(root, name.slice(2)) : name, ...args); };
require.extensions['.ts'] = function (module, filename) { module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename); };

const database = { snapshot: null, items: new Map(), owner: null, available: true, statements: [], insertedBatches: [] };
class FakePool {
  constructor(config) { assert.equal(config.connectionString, 'postgres://news-test-only'); }
  async connect() {
    if (!database.available) throw new Error('Database unavailable');
    return { query: this.query.bind(this), release() {} };
  }
  async query(sql, params = []) {
    database.statements.push({ sql, params });
    if (!database.available) throw new Error('Database unavailable');
    if (/SELECT snapshot FROM ofroot_news_snapshot/.test(sql)) return { rows: database.snapshot ? [{ snapshot: database.snapshot }] : [] };
    if (/INSERT INTO ofroot_news_refresh_leases/.test(sql)) {
      assert.match(sql, /WHERE ofroot_news_refresh_leases\.expires_at <= NOW\(\)/);
      if (database.owner) return { rows: [] };
      database.owner = params[0];
      return { rows: [{ owner: params[0] }] };
    }
    if (/DELETE FROM ofroot_news_refresh_leases/.test(sql)) {
      assert.match(sql, /owner = \$1/);
      if (database.owner === params[0]) database.owner = null;
    }
    if (/INSERT INTO ofroot_news_items/.test(sql)) {
      const items = JSON.parse(params[0]);
      database.insertedBatches.push(items);
      for (const item of items) database.items.set(item.id, item);
    }
    if (/SELECT item FROM ofroot_news_items/.test(sql)) return { rows: [...database.items.values()].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')).slice(0, 500).map(item => ({ item })) };
    if (/INSERT INTO ofroot_news_snapshot/.test(sql)) database.snapshot = JSON.parse(params[0]);
    return { rows: [] };
  }
}
Module._load = function (name, ...args) { return name === 'pg' ? { Pool: FakePool } : originalLoad.call(this, name, ...args); };
process.env.NEWS_DATABASE_URL = 'postgres://news-test-only';
process.env.DATABASE_URL = 'postgres://must-not-be-selected';
delete process.env.NEWS_BLOCKED_ARTICLE_IDS;
const { NEWS_SOURCES } = require('../app/lib/news/sources.ts');
const { acquireNewsRefreshLease, releaseNewsRefreshLease, ensureNewsSchema, saveStoredNews } = require('../app/lib/news/store.ts');
const { getNewsSnapshot, refreshNews } = require('../app/lib/news/index.ts');
const { newsRefreshHttpStatus } = require('../app/lib/news/refresh-status.ts');
const originalNow = Date.now;

function fixture(checkedAt, title = 'Stored metadata') {
  const item = { id: '0123456789abcdefabcd', title, url: 'https://www.fda.gov/news/stored', sourceId: 'fda', category: 'healthcare', kind: 'release', publishedAt: '2026-01-01' };
  return { articles: [item], sources: NEWS_SOURCES, sourceHealth: NEWS_SOURCES.map(source => ({ sourceId: source.id, status: source.enabled ? 'ok' : 'pending', checkedAt, ...(source.enabled ? { lastSuccessfulAt: checkedAt } : {}) })), checkedAt, lastSuccessfulAt: checkedAt, status: 'live', storage: 'postgres', refreshState: 'completed' };
}

(async () => {
  await Promise.all([ensureNewsSchema(), ensureNewsSchema()]);
  assert.equal(database.statements.filter(({ sql }) => /CREATE TABLE IF NOT EXISTS ofroot_news_items/.test(sql)).length, 1);
  assert(database.statements.some(({ sql }) => /pg_advisory_xact_lock/.test(sql)));
  const [leaseOne, leaseTwo] = await Promise.all([acquireNewsRefreshLease(), acquireNewsRefreshLease()]);
  assert.equal([leaseOne, leaseTwo].filter(Boolean).length, 1);
  const lease = leaseOne || leaseTwo;
  await releaseNewsRefreshLease('wrong-owner');
  assert.equal(database.owner, lease);
  await releaseNewsRefreshLease(lease);
  assert.equal(database.owner, null);

  const prior = fixture(new Date().toISOString());
  database.items.set(prior.articles[0].id, prior.articles[0]);
  const incoming = { ...prior.articles[0], id: '1123456789abcdefabcd', title: 'New metadata', url: 'https://www.fda.gov/news/new' };
  const archived = await saveStoredNews({ ...prior, articles: [...prior.articles, incoming] }, [incoming]);
  assert.equal(archived.length, 2);
  assert.deepEqual(database.insertedBatches.at(-1).map(item => item.id), [incoming.id]);
  assert.equal(database.snapshot.storage, 'postgres');

  let fetches = 0;
  global.fetch = async () => { fetches++; throw new Error('A fresh shared snapshot must prevent source fetching'); };
  global.__ofrootNewsState = undefined;
  const cold = await getNewsSnapshot();
  assert.equal(cold.articles.length, 2);
  assert.equal(fetches, 0);
  const newerTime = Date.now() + 61_000;
  database.snapshot = fixture(new Date(newerTime).toISOString(), 'Updated by the scheduled process');
  Date.now = () => newerTime;
  const warm = await getNewsSnapshot();
  assert.equal(warm.articles[0].title, 'Updated by the scheduled process');
  assert.equal(fetches, 0);
  Date.now = originalNow;

  const activeLease = await acquireNewsRefreshLease();
  const overlap = await refreshNews();
  assert.equal(overlap.refreshState, 'in_progress');
  assert.equal(newsRefreshHttpStatus(overlap, true), 202);
  assert.equal(fetches, 0);
  await releaseNewsRefreshLease(activeLease);

  database.snapshot = fixture(new Date(Date.now() - 60 * 60_000).toISOString());
  global.__ofrootNewsState = undefined;
  global.fetch = async url => { fetches++; return url.includes('known_exploited') ? new Response(JSON.stringify({ vulnerabilities: [{ cveID: 'CVE-2026-12345', vulnerabilityName: 'Known vulnerability metadata', dateAdded: '2026-01-01' }] })) : new Response('', { status: 503 }); };
  const refreshed = await getNewsSnapshot();
  assert.equal(refreshed.status, 'partial');
  assert.equal(refreshed.storage, 'postgres');
  assert.equal(refreshed.refreshState, 'completed');
  assert.equal(newsRefreshHttpStatus(refreshed, true), 200);
  assert.equal(database.owner, null);
  assert.equal(database.insertedBatches.at(-1).length, 1);

  global.fetch = async () => new Response('', { status: 503 });
  const failedSources = await refreshNews();
  assert.equal(failedSources.status, 'stale');
  assert.equal(failedSources.lastSuccessfulAt, refreshed.lastSuccessfulAt);
  assert.equal(failedSources.storage, 'postgres');
  assert.equal(newsRefreshHttpStatus(failedSources, true), 503);

  database.available = false;
  const beforeFailure = fetches;
  const failedDatabase = await refreshNews();
  assert.equal(failedDatabase.refreshState, 'failed');
  assert.equal(failedDatabase.storage, 'memory');
  assert.equal(fetches, beforeFailure);
  assert.equal(newsRefreshHttpStatus(failedDatabase, true), 503);
  console.log('PASS shared schema initialization, exclusive expiring lease, owner-safe release, archive provenance, cold/warm snapshot reuse, scheduler overlap and failure signaling');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { Date.now = originalNow; });
