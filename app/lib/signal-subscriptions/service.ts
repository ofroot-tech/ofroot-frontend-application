import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { assertSubscriptionConfiguration, escapeEmailHtml, nextSignalSend, SIGNAL_CONSENT_VERSION, SIGNAL_SITE_URL } from './config';
import { sendSignalEmail, signalEmailFrame } from './email';
import { consumeSubscriptionRate, ensureSubscriptionSchema, getSubscriptionDatabase, mapSubscriberRow, withSubscriptionTransaction } from './store';
import { createSubscriptionToken, verifySubscriptionToken } from './tokens';
import { SubscriptionError, type SignalPreferences, type SignalSubscriber, type SubscriberView } from './types';

const topicSchema = z.enum(['ai', 'integrations', 'healthcare', 'policy', 'cybersecurity']);
const preferencesSchema = z.object({ topics: z.array(topicSchema).min(1).max(5).refine(value => new Set(value).size === value.length), content: z.enum(['briefs', 'insights', 'both']), frequency: z.enum(['weekly', 'daily']) });
const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
const signupSchema = preferencesSchema.extend({ email: emailSchema, website: z.string().max(200).optional(), consent: z.literal(true) }).strict();
const updateSchema = preferencesSchema.extend({ paused: z.boolean().optional() }).strict();
const hashConfirmation = (value: string) => createHash('sha256').update(`signal-confirmation:${value}`).digest('hex');
const view = (subscriber: SignalSubscriber): SubscriberView => ({ email: subscriber.email, status: subscriber.status, topics: subscriber.topics, content: subscriber.content, frequency: subscriber.frequency, nextSendAt: subscriber.nextSendAt });
function parseEmail(value: unknown): string {
  const parsed = emailSchema.safeParse(value);
  if (!parsed.success) throw new SubscriptionError('Enter a valid email address.', 400);
  return parsed.data;
}

/** Signup can stage a preference change, but only the mailbox holder can apply
 * it. Active delivery settings remain unchanged while confirmation is pending. */
export async function beginSubscription(input: unknown, ip: string): Promise<void> {
  if (input && typeof input === 'object' && typeof (input as Record<string, unknown>).website === 'string' && String((input as Record<string, unknown>).website).trim()) return;
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) throw new SubscriptionError('Enter a valid email, choose at least one topic, and confirm your subscription consent.', 400);
  assertSubscriptionConfiguration();
  const { email, topics, content, frequency } = parsed.data;
  if (!await consumeSubscriptionRate(email, ip)) return;
  const rawToken = randomBytes(32).toString('base64url');
  const confirmationHash = hashConfirmation(rawToken);
  const pending = { topics, content, frequency } satisfies SignalPreferences;
  const accepted = await withSubscriptionTransaction(async client => {
    const result = await client.query(`INSERT INTO ofroot_signal_subscribers
      (id,email,status,topics,content,frequency,pending_preferences,confirmation_hash,confirmation_expires_at)
      VALUES ($1,$2,'pending',$3::jsonb,$4,$5,$6::jsonb,$7,NOW()+INTERVAL '24 hours')
      ON CONFLICT (email) DO UPDATE SET pending_preferences=EXCLUDED.pending_preferences,
      confirmation_hash=EXCLUDED.confirmation_hash,confirmation_expires_at=EXCLUDED.confirmation_expires_at,updated_at=NOW()
      WHERE ofroot_signal_subscribers.status <> 'suppressed'
      RETURNING id`, [randomUUID(), email, JSON.stringify(topics), content, frequency, JSON.stringify(pending), confirmationHash]);
    return result.rowCount === 1;
  });
  if (!accepted) return;
  const url = `${SIGNAL_SITE_URL}/news/confirm#token=${rawToken}`;
  const button = `<p style="margin:28px 0"><a href="${escapeEmailHtml(url)}" style="display:inline-block;background:#5b3f5c;border:1px solid #9b7f9e;color:#faf9fc;padding:16px 22px;text-decoration:none">Confirm Signal subscription →</a></p>`;
  await sendSignalEmail({
    to: email, subject: 'Confirm your Signal subscription', idempotencyKey: `signal-confirm-${confirmationHash}`,
    html: signalEmailFrame('Your topics. A clearer view.', `<p style="color:#c0b5cc;line-height:1.8">Confirm that you want OfRoot Signal emails for your selected topics, delivered ${frequency === 'weekly' ? 'weekly on Mondays' : 'as a daily digest'}. Your preferences take effect only after you confirm.</p>${button}<p style="color:#c0b5cc;line-height:1.8">This confirmation link expires in 24 hours. If you did not request it, you can ignore this message; an existing subscription is unchanged.</p>`),
    text: `Confirm your OfRoot Signal subscription\n\nDelivery: ${frequency === 'weekly' ? 'Weekly on Mondays' : 'Daily digest'}\nTopics: ${topics.join(', ')}\nContent: ${content}\n\nConfirm within 24 hours: ${url}\n\nIf you did not request this, ignore the email. Existing delivery preferences remain unchanged until confirmation.`,
  });
}

export async function confirmSubscription(rawToken: string): Promise<{ preferences: SubscriberView; managementToken: string }> {
  if (typeof rawToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(rawToken)) throw new SubscriptionError('This confirmation link is invalid or expired. Request a new confirmation.', 400);
  const subscriber = await withSubscriptionTransaction(async client => {
    const result = await client.query(`SELECT * FROM ofroot_signal_subscribers
      WHERE confirmation_hash=$1 AND confirmation_expires_at>NOW() FOR UPDATE`, [hashConfirmation(rawToken)]);
    const row = result.rows[0];
    if (!row || row.status === 'suppressed') throw new SubscriptionError('This confirmation link is invalid or expired. Request a new confirmation.', 400);
    const pending = preferencesSchema.safeParse(row.pending_preferences);
    if (!pending.success) throw new SubscriptionError('This confirmation link is invalid or expired. Request a new confirmation.', 400);
    const nextSend = nextSignalSend(pending.data.frequency);
    const updated = await client.query(`UPDATE ofroot_signal_subscribers SET status='active',topics=$2::jsonb,content=$3,frequency=$4,
      confirmed_at=NOW(),next_send_at=$5,token_version=token_version+1,consent_version=$6,
      pending_preferences=NULL,confirmation_hash=NULL,confirmation_expires_at=NULL,updated_at=NOW()
      WHERE id=$1 RETURNING *`, [row.id, JSON.stringify(pending.data.topics), pending.data.content, pending.data.frequency, nextSend, SIGNAL_CONSENT_VERSION]);
    return mapSubscriberRow(updated.rows[0]);
  });
  return { preferences: view(subscriber), managementToken: createSubscriptionToken(subscriber, 'manage') };
}

async function authenticatedSubscriber(token: string): Promise<SignalSubscriber> {
  const identity = verifySubscriptionToken(token, ['manage']);
  await ensureSubscriptionSchema();
  const result = await getSubscriptionDatabase().query('SELECT * FROM ofroot_signal_subscribers WHERE id=$1', [identity.sid]);
  if (!result.rows[0]) throw new SubscriptionError('This subscription link is no longer available. Request a fresh link.', 400);
  const subscriber = mapSubscriberRow(result.rows[0]);
  if (!subscriber.confirmedAt || subscriber.tokenVersion !== identity.version || !['active', 'paused'].includes(subscriber.status)) throw new SubscriptionError('This subscription link is no longer available. Request a fresh link.', 400);
  return subscriber;
}

export async function getSubscriberPreferences(token: string): Promise<SubscriberView> { return view(await authenticatedSubscriber(token)); }

export async function changeSubscriberPreferences(token: string, input: unknown): Promise<SubscriberView> {
  const identity = verifySubscriptionToken(token, ['manage']);
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) throw new SubscriptionError('Choose at least one topic and valid delivery preferences.', 400);
  const updated = await withSubscriptionTransaction(async client => {
    const result = await client.query('SELECT * FROM ofroot_signal_subscribers WHERE id=$1 FOR UPDATE', [identity.sid]);
    if (!result.rows[0]) throw new SubscriptionError('This subscription link is no longer available. Request a fresh link.', 400);
    const subscriber = mapSubscriberRow(result.rows[0]);
    if (!subscriber.confirmedAt || subscriber.tokenVersion !== identity.version || !['active', 'paused'].includes(subscriber.status)) throw new SubscriptionError('This subscription link is no longer available. Request a fresh link.', 400);
    const status = parsed.data.paused === undefined ? subscriber.status : parsed.data.paused ? 'paused' : 'active';
    const nextSend = status === 'paused' ? null : nextSignalSend(parsed.data.frequency);
    const changed = await client.query(`UPDATE ofroot_signal_subscribers SET topics=$2::jsonb,content=$3,frequency=$4,
      status=$5,next_send_at=$6,updated_at=NOW() WHERE id=$1 RETURNING *`, [subscriber.id, JSON.stringify(parsed.data.topics), parsed.data.content, parsed.data.frequency, status, nextSend]);
    return mapSubscriberRow(changed.rows[0]);
  });
  return view(updated);
}

/** Access requests have the same public result for every address. No account
 * exists to create, and unconfirmed or suppressed records cannot obtain access. */
export async function requestPreferencesLink(value: unknown, ip: string): Promise<void> {
  const email = parseEmail(value);
  assertSubscriptionConfiguration();
  if (!await consumeSubscriptionRate(email, ip)) return;
  await ensureSubscriptionSchema();
  const result = await getSubscriptionDatabase().query("SELECT * FROM ofroot_signal_subscribers WHERE email=$1 AND confirmed_at IS NOT NULL AND status IN ('active','paused')", [email]);
  if (!result.rows[0]) return;
  const subscriber = mapSubscriberRow(result.rows[0]);
  const token = createSubscriptionToken(subscriber, 'manage');
  const url = `${SIGNAL_SITE_URL}/news/preferences#token=${token}`;
  const fingerprint = createHash('sha256').update(token).digest('hex');
  try {
    await sendSignalEmail({ to: email, subject: 'Manage your Signal preferences', idempotencyKey: `signal-access-${fingerprint}`,
      html: signalEmailFrame('Make Signal yours.', `<p style="color:#c0b5cc;line-height:1.8">Use this private link to choose topics, change delivery frequency, pause, or unsubscribe.</p><p style="margin:28px 0"><a href="${escapeEmailHtml(url)}" style="display:inline-block;background:#5b3f5c;border:1px solid #9b7f9e;color:#faf9fc;padding:16px 22px;text-decoration:none">Manage Signal preferences →</a></p><p style="color:#c0b5cc;line-height:1.8">If you did not request this link, ignore this email. Your preferences have not changed.</p>`),
      text: `Manage your OfRoot Signal preferences\n\n${url}\n\nThis private link lets you choose topics, change frequency, pause, or unsubscribe. If you did not request it, ignore this email; your preferences are unchanged.`,
    });
  } catch { console.warn('Signal preference-link delivery was not confirmed.'); }
}

/** Opt-out is idempotent and deliberately narrower than management access.
 * Old unsubscribe links can still stop a later re-subscription to this list. */
export async function unsubscribeSignal(token: string): Promise<void> {
  const identity = verifySubscriptionToken(token, ['unsubscribe', 'manage']);
  await ensureSubscriptionSchema();
  const db = getSubscriptionDatabase();
  if (identity.purpose === 'manage') {
    const result = await db.query('SELECT * FROM ofroot_signal_subscribers WHERE id=$1', [identity.sid]);
    if (result.rows[0] && mapSubscriberRow(result.rows[0]).tokenVersion !== identity.version) throw new SubscriptionError('This subscription link is no longer available. Request a fresh link.', 400);
  }
  // A complaint/bounce suppression must stay suppressed; an opt-out cannot
  // downgrade it into a publicly reactivatable state.
  await db.query(`UPDATE ofroot_signal_subscribers SET status=CASE WHEN status='suppressed' THEN status ELSE 'unsubscribed' END,
    next_send_at=NULL,pending_preferences=NULL,confirmation_hash=NULL,confirmation_expires_at=NULL,
    token_version=CASE WHEN status IN ('unsubscribed','suppressed') THEN token_version ELSE token_version+1 END,updated_at=NOW() WHERE id=$1`, [identity.sid]);
}
