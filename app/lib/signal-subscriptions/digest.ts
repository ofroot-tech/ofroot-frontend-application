import { createHash, randomUUID } from 'node:crypto';
import { getNewsSnapshot } from '@/app/lib/news';
import type { NewsCategory, NewsSnapshot } from '@/app/lib/news/types';
import { insights, type Insight } from '@/app/lib/insights-content';
import { getBriefForArticle } from '@/app/lib/signal-briefs';
import { supportsBrief } from '@/app/lib/signal-briefs/evidence';
import { abridgeAbstract } from '@/app/lib/signal-briefs/compose';
import { assertSubscriptionConfiguration, escapeEmailHtml, nextSignalSend, SIGNAL_SITE_URL } from './config';
import { sendSignalEmail, signalEmailFrame, type SignalEmail } from './email';
import { getSubscriptionDatabase, ensureSubscriptionSchema, mapSubscriberRow } from './store';
import { createSubscriptionToken } from './tokens';
import type { DigestItem, SignalSubscriber } from './types';
import { SubscriptionError } from './types';

const EMAIL_EVIDENCE_SOURCES = new Set(['arxiv', 'arxiv-integrations', 'federal-register', 'cisa', 'fda']);
const DIGEST_VERSION = 'signal-digest-1';
const MAX_ITEMS = 5;
const MAX_SCANNED = 100;
const MAX_DAILY_SENDS = 50;
declare global { var __ofrootDigestSchema: Promise<void> | undefined; }

/** Marketing digests need the business's supplied public postal address.
 * Confirmation and account-access emails do not depend on this setting. */
function signalPostalAddress(): string {
  const address = process.env.SIGNAL_POSTAL_ADDRESS?.trim();
  if (!address || address.length > 500 || /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/.test(address)) {
    throw new SubscriptionError('Signal digest delivery is awaiting its public postal address.', 503);
  }
  return address;
}

/** Only original OfRoot material and the explicitly reviewed primary-source
 * adapters enter email. Website RSS discovery permission is not email consent. */
export function insightTopic(insight: Pick<Insight, 'title' | 'slug' | 'category'>): NewsCategory | null {
  const subject = `${insight.category} ${insight.slug} ${insight.title}`;
  if (/cyber|security|privacy|threat|vulnerab/i.test(subject)) return 'cybersecurity';
  if (/healthcare|clinical|patient|medical|clinic/i.test(subject)) return 'healthcare';
  if (/polic|regulat|compliance|governance/i.test(subject)) return 'policy';
  if (/integrat|interoperab|\bapi\b|connector|hubspot|workflow|automation/i.test(subject)) return 'integrations';
  if (/\bai\b|\bllm\b|artificial.intelligence|language.model|agent/i.test(subject)) return 'ai';
  return null;
}

function publicationTime(value: string | null | undefined): number {
  if (!value) return NaN;
  return Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
}

export function isFreshForDigest(value: string | null | undefined, subscriber: Pick<SignalSubscriber, 'frequency'> & Partial<Pick<SignalSubscriber, 'lastSentAt'>>, now: Date): boolean {
  const timestamp = publicationTime(value);
  const window = subscriber.frequency === 'daily' ? 86_400_000 : 7 * 86_400_000;
  const previous = publicationTime(subscriber.lastSentAt);
  // Using the prior issue boundary avoids gaps when the host's one-hour cron
  // window runs later than yesterday. The first issue uses its stated cadence.
  const since = Number.isFinite(previous) && previous <= now.getTime() ? previous : now.getTime() - window;
  return Number.isFinite(timestamp) && timestamp <= now.getTime() && timestamp > since;
}

/** One item can belong to one or several interests without being sent twice.
 * Round-robin selection gives a mixed digest a useful spread across choices. */
export function chooseDigestItems(items: DigestItem[], topics: NewsCategory[], excluded = new Set<string>(), limit = MAX_ITEMS): DigestItem[] {
  const unique = new Map<string, DigestItem>();
  for (const item of items) if (topics.includes(item.topic) && !excluded.has(item.key) && !unique.has(item.key)) unique.set(item.key, item);
  const sorted = [...unique.values()].sort((a, b) => publicationTime(b.publishedAt) - publicationTime(a.publishedAt) || a.key.localeCompare(b.key));
  const queues = topics.map(topic => sorted.filter(item => item.topic === topic));
  const chosen: DigestItem[] = [];
  while (chosen.length < Math.min(limit, MAX_ITEMS)) {
    let added = false;
    for (const queue of queues) {
      const item = queue.shift();
      if (item) { chosen.push(item); added = true; }
      if (chosen.length >= Math.min(limit, MAX_ITEMS)) break;
    }
    if (!added) break;
  }
  return chosen;
}

export async function prepareDigestItems(subscriber: SignalSubscriber, excluded = new Set<string>(), now = new Date(), supplied?: { snapshot?: NewsSnapshot; insights?: Insight[]; deadline?: number }): Promise<DigestItem[]> {
  const candidates: DigestItem[] = [];
  if (subscriber.content !== 'briefs') {
    for (const insight of supplied?.insights || insights) {
      const topic = insightTopic(insight);
      // A modification date does not make an older guide a newly published one.
      if (!topic || !subscriber.topics.includes(topic) || !isFreshForDigest(insight.published, subscriber, now)) continue;
      candidates.push({ key: `insight:${insight.slug}`, title: insight.title, url: `${SIGNAL_SITE_URL}/insights/${insight.slug}`, excerpt: insight.description,
        kind: 'insight', topic, publishedAt: insight.published!, source: 'OfRoot Insights', sourceUrl: `${SIGNAL_SITE_URL}/insights/${insight.slug}` });
    }
  }
  if (subscriber.content !== 'insights') {
    const snapshot = supplied?.snapshot || await getNewsSnapshot();
    const references = snapshot.articles.filter(article => EMAIL_EVIDENCE_SOURCES.has(article.sourceId) && supportsBrief(article)
      && subscriber.topics.includes(article.category) && isFreshForDigest(article.publishedAt, subscriber, now) && !excluded.has(`brief:${article.id}`)).slice(0, 20);
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(3, references.length) }, async () => {
      while (cursor < references.length) {
        if (supplied?.deadline !== undefined && Date.now() >= supplied.deadline) throw new Error('Digest preparation time budget reached.');
        const article = references[cursor++];
        const brief = await getBriefForArticle(article);
        if (brief.status !== 'ready' || !brief.evidence) continue;
        candidates.push({ key: `brief:${article.id}`, title: article.title, url: `${SIGNAL_SITE_URL}/news/brief/${article.id}`,
          excerpt: abridgeAbstract(brief.digest, 55) || 'Review the cited primary record, its structured details, and the evidence scope in this Signal brief.',
          kind: 'brief', topic: article.category, publishedAt: article.publishedAt!, source: brief.evidence.publisher, sourceUrl: brief.evidence.url });
      }
    }));
  }
  return chooseDigestItems(candidates, subscriber.topics, excluded);
}

export function digestIssueId(subscriberId: string, dueAt: string): string {
  return createHash('sha256').update(`${DIGEST_VERSION}:${subscriberId}:${new Date(dueAt).toISOString()}`).digest('hex').slice(0, 40);
}

/** Personal links are signed for this issue time. The provider idempotency key
 * is stable for the due occurrence; it is never shared between recipients. */
export function renderSignalDigest(subscriber: SignalSubscriber, items: DigestItem[], issueId: string, issuedAt: Date): SignalEmail {
  const postalAddress = signalPostalAddress();
  const manage = `${SIGNAL_SITE_URL}/news/preferences#token=${encodeURIComponent(createSubscriptionToken(subscriber, 'manage', issuedAt))}`;
  const unsubscribeToken = createSubscriptionToken(subscriber, 'unsubscribe', issuedAt);
  const humanUnsubscribe = `${SIGNAL_SITE_URL}/news/unsubscribe#token=${encodeURIComponent(unsubscribeToken)}`;
  const oneClick = `${SIGNAL_SITE_URL}/api/news/subscriptions/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const date = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(issuedAt);
  const e = escapeEmailHtml;
  const cards = items.map(item => `<section style="padding:25px 0;border-top:1px solid #51415f"><p style="font-size:11px;color:#c3afe1;text-transform:uppercase;letter-spacing:1px">${item.kind === 'brief' ? 'Signal source digest' : 'OfRoot Insights'} · ${e(item.topic)}</p><h2 style="font-size:23px;line-height:1.3;font-weight:500"><a href="${e(item.url)}" style="color:#faf9fc;text-decoration:none">${e(item.title)}</a></h2><p style="font-size:15px;line-height:1.8;color:#c0b5cc">${e(item.excerpt)}</p><p style="font-size:12px;line-height:1.8;color:#c0b5cc">${item.kind === 'brief' ? 'From the primary record: ' : 'Published by '}<a href="${e(item.sourceUrl)}" style="color:#dfc7f1">${e(item.source)}</a></p><a href="${e(item.url)}" style="display:inline-block;padding:12px 0;color:#ffb78f;font-size:14px">${item.kind === 'brief' ? 'Read the cited brief' : 'Read the article'} →</a></section>`).join('');
  const footer = `You confirmed a ${subscriber.frequency} Signal digest for your selected interests.<br /><a href="${e(manage)}" style="color:#dfc7f1">Manage preferences or pause</a> · <a href="${e(humanUnsubscribe)}" style="color:#dfc7f1">Unsubscribe</a><br />OfRoot Signal · <a href="${SIGNAL_SITE_URL}/news/methodology#briefs" style="color:#dfc7f1">How sources are used</a><br />${e(postalAddress).replace(/\r?\n/g, '<br />')}`;
  const heading = subscriber.frequency === 'weekly' ? 'Your weekly Signal.' : 'Your daily Signal.';
  return { to: subscriber.email, subject: `Signal · ${items.length} ${items.length === 1 ? 'read' : 'reads'} for ${date}`,
    html: signalEmailFrame(heading, `<p style="color:#c0b5cc;font-size:15px;line-height:1.8">${e(date)} · A short collection for the topics you chose. Source excerpts and OfRoot writing are identified separately.</p>${cards}`, footer),
    text: `${heading}\n${date}\n\n${items.map(item => `${item.kind === 'brief' ? 'SIGNAL SOURCE DIGEST' : 'OFROOT INSIGHTS'} · ${item.topic}\n${item.title}\n${item.excerpt}\nSource: ${item.source} ${item.sourceUrl}\nRead: ${item.url}`).join('\n\n')}\n\nManage preferences or pause: ${manage}\nUnsubscribe: ${humanUnsubscribe}\nOfRoot Signal · ${SIGNAL_SITE_URL}/news/methodology#briefs\n${postalAddress}`,
    idempotencyKey: `signal-digest/${issueId}`, unsubscribeUrl: oneClick };
}

/** A global expiring lease prevents overlapping cron invocations from spending
 * the same daily budget. Per-occurrence and per-item rows survive process loss. */
export async function ensureDigestSchema(): Promise<void> {
  await ensureSubscriptionSchema();
  const db = getSubscriptionDatabase();
  if (!global.__ofrootDigestSchema) {
    global.__ofrootDigestSchema = (async () => {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query("SET LOCAL lock_timeout = '3s'");
        await client.query('SELECT pg_advisory_xact_lock($1)', [741908331]);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_digest_issues (
          id TEXT PRIMARY KEY, subscriber_id UUID NOT NULL REFERENCES ofroot_signal_subscribers(id), due_at TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL DEFAULT 'preparing', owner TEXT NOT NULL, lease_until TIMESTAMPTZ NOT NULL,
          item_keys JSONB NOT NULL DEFAULT '[]'::jsonb, provider_id TEXT, attempted_at TIMESTAMPTZ, sent_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(subscriber_id,due_at)
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_digest_items (
          subscriber_id UUID NOT NULL REFERENCES ofroot_signal_subscribers(id), item_key TEXT NOT NULL,
          issue_id TEXT NOT NULL REFERENCES ofroot_signal_digest_issues(id), status TEXT NOT NULL DEFAULT 'reserved',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(subscriber_id,item_key)
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_digest_leases (id TEXT PRIMARY KEY, owner TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`);
        await client.query(`CREATE TABLE IF NOT EXISTS ofroot_signal_email_events (
          id TEXT PRIMARY KEY, event_type TEXT NOT NULL, provider_id TEXT NOT NULL,
          applied_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await client.query('CREATE INDEX IF NOT EXISTS ofroot_signal_digest_provider_idx ON ofroot_signal_digest_issues(provider_id)');
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
      finally { client.release(); }
    })();
    global.__ofrootDigestSchema.catch(() => { global.__ofrootDigestSchema = undefined; });
  }
  await global.__ofrootDigestSchema;
}

type DigestIssue = { id: string; owner: string; dueAt: string };
export type DigestDispatchResult = { ok: boolean; state: 'completed' | 'in_progress' | 'dry_run'; due: number; scanned: number; sent: number; empty: number; cancelled: number; uncertain: number; errors: number; remaining: number };

async function claimIssue(subscriber: SignalSubscriber, owner: string, now: Date): Promise<DigestIssue | null> {
  if (!subscriber.nextSendAt) return null;
  const id = digestIssueId(subscriber.id, subscriber.nextSendAt);
  const result = await getSubscriptionDatabase().query(`INSERT INTO ofroot_signal_digest_issues (id,subscriber_id,due_at,owner,lease_until)
    VALUES ($1,$2,$3,$4,$5) ON CONFLICT (subscriber_id,due_at) DO UPDATE SET owner=EXCLUDED.owner,lease_until=EXCLUDED.lease_until
    WHERE ofroot_signal_digest_issues.status='preparing' AND ofroot_signal_digest_issues.lease_until < $6 RETURNING id`,
  [id, subscriber.id, subscriber.nextSendAt, owner, new Date(now.getTime() + 10 * 60_000).toISOString(), now.toISOString()]);
  return result.rowCount ? { id, owner, dueAt: subscriber.nextSendAt } : null;
}

async function finishWithoutSend(subscriber: SignalSubscriber, issue: DigestIssue, status: 'empty' | 'cancelled', now: Date): Promise<void> {
  const client = await getSubscriptionDatabase().connect();
  try {
    await client.query('BEGIN');
    await client.query("UPDATE ofroot_signal_digest_issues SET status=$1 WHERE id=$2 AND owner=$3 AND status='preparing'", [status, issue.id, issue.owner]);
    await client.query(`UPDATE ofroot_signal_subscribers SET next_send_at=$1 WHERE id=$2 AND status='active' AND next_send_at=$3`, [nextSignalSend(subscriber.frequency, now), subscriber.id, issue.dueAt]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
}

/** Consent is checked again in the reservation transaction immediately before
 * the provider request. A preference update or pause cancels this occurrence. */
async function reserveForSend(subscriber: SignalSubscriber, issue: DigestIssue, items: DigestItem[], now: Date): Promise<DigestItem[]> {
  const client = await getSubscriptionDatabase().connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM ofroot_signal_subscribers WHERE id=$1 FOR UPDATE', [subscriber.id]);
    const live = result.rows[0] ? mapSubscriberRow(result.rows[0]) : null;
    if (!live || live.status !== 'active' || !live.confirmedAt || live.nextSendAt !== issue.dueAt || live.tokenVersion !== subscriber.tokenVersion
      || live.content !== subscriber.content || live.frequency !== subscriber.frequency || JSON.stringify(live.topics) !== JSON.stringify(subscriber.topics)) {
      await client.query("UPDATE ofroot_signal_digest_issues SET status='cancelled' WHERE id=$1 AND owner=$2 AND status='preparing'", [issue.id, issue.owner]);
      if (live?.status === 'active' && live.nextSendAt === issue.dueAt) await client.query('UPDATE ofroot_signal_subscribers SET next_send_at=$1 WHERE id=$2 AND next_send_at=$3', [nextSignalSend(live.frequency, now), live.id, issue.dueAt]);
      await client.query('COMMIT'); return [];
    }
    const owned = await client.query("SELECT id FROM ofroot_signal_digest_issues WHERE id=$1 AND owner=$2 AND status='preparing' FOR UPDATE", [issue.id, issue.owner]);
    if (!owned.rowCount) { await client.query('ROLLBACK'); return []; }
    const reserved: DigestItem[] = [];
    for (const item of items) {
      const inserted = await client.query(`INSERT INTO ofroot_signal_digest_items (subscriber_id,item_key,issue_id) VALUES ($1,$2,$3)
        ON CONFLICT (subscriber_id,item_key) DO NOTHING RETURNING item_key`, [subscriber.id, item.key, issue.id]);
      if (inserted.rowCount) reserved.push(item);
    }
    if (!reserved.length) {
      await client.query("UPDATE ofroot_signal_digest_issues SET status='empty' WHERE id=$1", [issue.id]);
      await client.query('UPDATE ofroot_signal_subscribers SET next_send_at=$1 WHERE id=$2', [nextSignalSend(subscriber.frequency, now), subscriber.id]);
    } else {
      await client.query("UPDATE ofroot_signal_digest_issues SET status='sending',item_keys=$1::jsonb,attempted_at=$2 WHERE id=$3", [JSON.stringify(reserved.map(item => item.key)), now.toISOString(), issue.id]);
    }
    await client.query('COMMIT'); return reserved;
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
}

async function settleIssue(subscriber: SignalSubscriber, issue: DigestIssue, now: Date, providerId: string | null): Promise<void> {
  const status = providerId ? 'sent' : 'uncertain';
  const client = await getSubscriptionDatabase().connect();
  try {
    await client.query('BEGIN');
    const changed = await client.query("UPDATE ofroot_signal_digest_issues SET status=$1,provider_id=$2,sent_at=$3 WHERE id=$4 AND owner=$5 AND status='sending' RETURNING id", [status, providerId, providerId ? now.toISOString() : null, issue.id, issue.owner]);
    if (changed.rowCount) {
      await client.query('UPDATE ofroot_signal_digest_items SET status=$1 WHERE issue_id=$2', [status, issue.id]);
      await client.query(`UPDATE ofroot_signal_subscribers SET next_send_at=$1,last_sent_at=CASE WHEN $2::boolean THEN $3::timestamptz ELSE last_sent_at END
        WHERE id=$4 AND status='active' AND next_send_at=$5`, [nextSignalSend(subscriber.frequency, now), !!providerId, now.toISOString(), subscriber.id, issue.dueAt]);
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
  if (providerId) await applyDigestSuppression(providerId).catch(() => console.warn('Signal delivery-event reconciliation is pending.'));
}

/** A bounce can arrive before the API acknowledgement is persisted. Events
 * therefore wait by provider receipt ID and reconcile after the receipt exists. */
export async function applyDigestSuppression(providerId: string): Promise<void> {
  const client = await getSubscriptionDatabase().connect();
  try {
    await client.query('BEGIN');
    const event = await client.query(`SELECT id FROM ofroot_signal_email_events WHERE provider_id=$1 AND applied_at IS NULL
      AND event_type IN ('email.bounced','email.complained','email.suppressed') FOR UPDATE`, [providerId]);
    if (event.rowCount) {
      const receipt = await client.query('SELECT subscriber_id FROM ofroot_signal_digest_issues WHERE provider_id=$1', [providerId]);
      if (receipt.rows[0]) {
        await client.query(`UPDATE ofroot_signal_subscribers SET status='suppressed',next_send_at=NULL,
          token_version=CASE WHEN status='suppressed' THEN token_version ELSE token_version+1 END,
          pending_preferences=NULL,confirmation_hash=NULL,confirmation_expires_at=NULL,updated_at=NOW() WHERE id=$1`, [receipt.rows[0].subscriber_id]);
        await client.query('UPDATE ofroot_signal_email_events SET applied_at=NOW() WHERE provider_id=$1 AND applied_at IS NULL', [providerId]);
      }
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
}

/** A lost acknowledgement can mean the email was delivered. Keep its items
 * reserved and advance the schedule; never retry it after Resend's 24h window. */
async function recoverAmbiguousAttempts(now: Date): Promise<number> {
  const db = getSubscriptionDatabase();
  const stale = await db.query(`SELECT i.id AS issue_id,i.owner AS issue_owner,i.due_at,s.* FROM ofroot_signal_digest_issues i JOIN ofroot_signal_subscribers s ON s.id=i.subscriber_id
    WHERE i.status='sending' AND i.lease_until < $1 ORDER BY i.attempted_at LIMIT 100`, [now.toISOString()]);
  for (const row of stale.rows) {
    const subscriber = mapSubscriberRow(row);
    await settleIssue(subscriber, { id: row.issue_id, owner: row.issue_owner, dueAt: new Date(row.due_at).toISOString() }, now, null);
  }
  const pendingEvents = await db.query(`SELECT DISTINCT e.provider_id FROM ofroot_signal_email_events e
    JOIN ofroot_signal_digest_issues i ON i.provider_id=e.provider_id WHERE e.applied_at IS NULL LIMIT 100`);
  for (const row of pendingEvents.rows) await applyDigestSuppression(String(row.provider_id));
  return stale.rows.length;
}

function boundedNumber(value: unknown, fallback: number, ceiling: number): number {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? Math.min(number, ceiling) : fallback;
}

export async function dispatchSignalDigests(options: { now?: Date; dryRun?: boolean; maxRecipients?: number; pause?: (ms: number) => Promise<void> } = {}): Promise<DigestDispatchResult> {
  assertSubscriptionConfiguration();
  if (!options.dryRun) {
    signalPostalAddress();
    if (!process.env.RESEND_WEBHOOK_SECRET?.startsWith('whsec_')) throw new SubscriptionError('Signal delivery-event verification is awaiting configuration.', 503);
  }
  // Leave a full minute for bounded in-flight source reads, the provider
  // acknowledgement, and durable ledger writes before the 300-second limit.
  const preparationDeadline = Date.now() + 200_000;
  await ensureDigestSchema();
  const db = getSubscriptionDatabase();
  const now = options.now || new Date();
  const count = await db.query("SELECT COUNT(*)::int AS count FROM ofroot_signal_subscribers WHERE status='active' AND confirmed_at IS NOT NULL AND next_send_at <= $1", [now.toISOString()]);
  const due = Number(count.rows[0]?.count || 0);
  const result: DigestDispatchResult = { ok: true, state: options.dryRun ? 'dry_run' : 'completed', due, scanned: 0, sent: 0, empty: 0, cancelled: 0, uncertain: 0, errors: 0, remaining: due };
  if (options.dryRun) return result;
  const owner = randomUUID();
  const lease = await db.query(`INSERT INTO ofroot_signal_digest_leases (id,owner,expires_at) VALUES ('daily',$1,$2)
    ON CONFLICT (id) DO UPDATE SET owner=EXCLUDED.owner,expires_at=EXCLUDED.expires_at
    WHERE ofroot_signal_digest_leases.expires_at <= $3 RETURNING owner`, [owner, new Date(now.getTime() + 10 * 60_000).toISOString(), now.toISOString()]);
  if (lease.rows[0]?.owner !== owner) return { ...result, state: 'in_progress' };
  try {
    result.uncertain += await recoverAmbiguousAttempts(now);
    const dayStart = new Date(now); dayStart.setUTCHours(0, 0, 0, 0);
    const spent = await db.query("SELECT COUNT(*)::int AS count FROM ofroot_signal_digest_issues WHERE attempted_at >= $1 AND attempted_at <= $2", [dayStart.toISOString(), now.toISOString()]);
    const dailyCap = boundedNumber(process.env.SIGNAL_DIGEST_MAX_PER_DAY, MAX_DAILY_SENDS, MAX_DAILY_SENDS);
    const cap = Math.min(boundedNumber(options.maxRecipients || process.env.SIGNAL_DIGEST_BATCH_SIZE, 25, MAX_DAILY_SENDS), Math.max(0, dailyCap - Number(spent.rows[0]?.count || 0)));
    if (!cap) return { ...result, ok: result.uncertain === 0 };
    const rows = await db.query("SELECT * FROM ofroot_signal_subscribers WHERE status='active' AND confirmed_at IS NOT NULL AND next_send_at <= $1 ORDER BY next_send_at,id LIMIT $2", [now.toISOString(), MAX_SCANNED]);
    let attempts = 0;
    let lastAttempt = 0;
    const pause = options.pause || (ms => new Promise(resolve => setTimeout(resolve, ms)));
    for (const row of rows.rows) {
      if (attempts >= cap || Date.now() >= preparationDeadline) break;
      result.scanned++;
      const subscriber = mapSubscriberRow(row);
      if (subscriber.status !== 'active' || !subscriber.confirmedAt || !subscriber.nextSendAt || Date.parse(subscriber.nextSendAt) > now.getTime()) { result.cancelled++; continue; }
      const issue = await claimIssue(subscriber, owner, now);
      if (!issue) continue;
      try {
        const history = await db.query('SELECT item_key FROM ofroot_signal_digest_items WHERE subscriber_id=$1', [subscriber.id]);
        const items = await prepareDigestItems(subscriber, new Set(history.rows.map(item => String(item.item_key))), now, { deadline: preparationDeadline });
        if (Date.now() >= preparationDeadline) throw new Error('Digest preparation time budget reached.');
        if (!items.length) { await finishWithoutSend(subscriber, issue, 'empty', now); result.empty++; continue; }
        const selected = await reserveForSend(subscriber, issue, items, now);
        if (!selected.length) { result.cancelled++; continue; }
        const wait = 550 - (Date.now() - lastAttempt);
        if (wait > 0) await pause(wait);
        attempts++; lastAttempt = Date.now();
        try {
          const receipt = await sendSignalEmail(renderSignalDigest(subscriber, selected, issue.id, now));
          await settleIssue(subscriber, issue, now, receipt.id);
          result.sent++;
        } catch {
          await settleIssue(subscriber, issue, now, null).catch(() => undefined);
          result.uncertain++;
        }
      } catch {
        result.errors++;
        // Preparation failed before a provider attempt. Release its lease for a
        // later authenticated run; there is no email side effect to duplicate.
        await db.query("UPDATE ofroot_signal_digest_issues SET lease_until=$1 WHERE id=$2 AND status='preparing' AND owner=$3", [now.toISOString(), issue.id, owner]).catch(() => undefined);
      }
    }
    const remaining = await db.query("SELECT COUNT(*)::int AS count FROM ofroot_signal_subscribers WHERE status='active' AND confirmed_at IS NOT NULL AND next_send_at <= $1", [now.toISOString()]);
    result.remaining = Number(remaining.rows[0]?.count || 0);
    result.ok = result.errors === 0 && result.uncertain === 0;
    return result;
  } finally { await db.query("DELETE FROM ofroot_signal_digest_leases WHERE id='daily' AND owner=$1", [owner]).catch(() => undefined); }
}
