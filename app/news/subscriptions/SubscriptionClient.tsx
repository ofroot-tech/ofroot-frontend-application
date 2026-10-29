'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Mail, Pause, Play } from 'lucide-react';
import { topics as signalTopics } from '../presentation';
import type { NewsCategory } from '@/app/lib/news/types';
import type { SignalContent, SignalFrequency, SubscriberView } from '@/app/lib/signal-subscriptions/types';
import styles from './subscription.module.css';
import DigestPreview from './DigestPreview';

type Mode = 'subscribe' | 'confirm' | 'preferences' | 'unsubscribe';
type ApiResult = { ok?: boolean; message?: string; error?: string; preferences?: SubscriberView; managementToken?: string };
const contentOptions: { value: SignalContent; title: string; description: string }[] = [
  { value: 'both', title: 'Briefs and OfRoot articles', description: 'Source-linked Signal digests and original OfRoot guides.' },
  { value: 'briefs', title: 'Signal briefs', description: 'Short digests from approved research and agency records.' },
  { value: 'insights', title: 'OfRoot Insights', description: 'Original guides on AI, integrations, and useful software.' },
];

async function callSubscription(path: string, body: unknown, method = 'POST', signal?: AbortSignal): Promise<ApiResult> {
  const response = await fetch(`/api/news/subscriptions${path}`, { method, headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify(body), signal });
  const result: ApiResult = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || 'We could not complete that request. Please try again.');
  return result;
}

/** Private credentials arrive in the fragment, which is removed before any
 * request. They stay in component memory; no account password or browser storage
 * is required, and simply visiting a confirmation/unsubscribe page changes nothing. */
export default function SubscriptionClient({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<NewsCategory[]>(['ai', 'integrations']);
  const [content, setContent] = useState<SignalContent>('both');
  const [frequency, setFrequency] = useState<SignalFrequency>('weekly');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [token, setToken] = useState('');
  const [tokenRead, setTokenRead] = useState(mode === 'subscribe');
  const [preferences, setPreferences] = useState<SubscriberView | null>(null);
  const [managementToken, setManagementToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);
  const privateLink = useRef<{ key: string; value: string } | null>(null);

  const applyPreferences = useCallback((value: SubscriberView) => {
    setPreferences(value); setEmail(value.email); setSelectedTopics(value.topics); setContent(value.content); setFrequency(value.frequency);
  }, []);
  useEffect(() => {
    if (mode === 'subscribe') {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('topic');
      if (signalTopics.some(topic => topic.id === requested)) setSelectedTopics([requested as NewsCategory]);
      const requestedContent = params.get('content');
      if (requestedContent === 'briefs' || requestedContent === 'insights' || requestedContent === 'both') setContent(requestedContent);
      return;
    }
    const key = `${mode}:${window.location.pathname}`;
    // StrictMode can re-run effects after the first effect removed the fragment.
    // Reuse only this mounted page's private value, never browser persistence.
    if (window.location.hash) {
      const value = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
      privateLink.current = { key, value: value.length <= 1500 ? value : '' };
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
    } else if (privateLink.current?.key !== key) privateLink.current = { key, value: '' };
    const value = privateLink.current?.value || '';
    setToken(value.length <= 1500 ? value : ''); setTokenRead(true);
    if (mode !== 'preferences' || !value || value.length > 1500) return;
    const controller = new AbortController();
    setLoading(true);
    callSubscription('/preferences', { token: value }, 'POST', controller.signal)
      .then(result => { if (result.preferences) applyPreferences(result.preferences); })
      .catch(reason => { if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : 'This link is unavailable. Request a fresh one.'); setToken(''); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [mode, applyPreferences]);

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not complete that request. Please try again.'); }
    finally { setBusy(false); }
  }
  function chooseTopic(id: NewsCategory) { setSelectedTopics(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]); }
  function validateChoices(): boolean {
    if (!selectedTopics.length) { setError('Choose at least one topic.'); return false; }
    return true;
  }
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!validateChoices()) return;
    if (!consent) { setError('Confirm that you want Signal emails before subscribing.'); return; }
    await run(async () => {
      const result = await callSubscription('', { email, topics: selectedTopics, content, frequency, consent, website });
      setMessage(result.message || 'Check your inbox for your confirmation link.'); setCompleted(true);
    });
  }
  async function requestAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => { const result = await callSubscription('/access', { email, website }); setMessage(result.message || 'If this address has a confirmed subscription, a private link will arrive by email.'); });
  }
  async function confirm() {
    await run(async () => {
      const result = await callSubscription('/confirm', { token });
      if (!result.preferences || !result.managementToken) throw new Error('Your confirmation was not completed. Please request a fresh link.');
      applyPreferences(result.preferences); setManagementToken(result.managementToken); setCompleted(true);
    });
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!validateChoices()) return;
    await run(async () => { const result = await callSubscription('/preferences', { token, topics: selectedTopics, content, frequency }, 'PATCH'); if (result.preferences) applyPreferences(result.preferences); setMessage('Your Signal preferences are saved.'); });
  }
  async function togglePause() {
    if (!preferences) return;
    await run(async () => {
      const result = await callSubscription('/preferences', { token, topics: preferences.topics, content: preferences.content, frequency: preferences.frequency, paused: preferences.status !== 'paused' }, 'PATCH');
      if (result.preferences) applyPreferences(result.preferences);
      setMessage(result.preferences?.status === 'paused' ? 'Signal emails are paused. Your choices are saved.' : 'Signal emails have resumed.');
    });
  }
  async function unsubscribe() {
    await run(async () => { await callSubscription('/unsubscribe', { token }); setCompleted(true); setMessage('You are unsubscribed from Signal email.'); setPreferences(null); });
  }

  const feedback = <>{error && <p role="alert" className={styles.error}>{error}</p>}{message && <p role="status" className={styles.message}>{message}</p>}</>;
  const honeypot = <label className={styles.honeypot} aria-hidden="true">Website<input name="website" value={website} onChange={event => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label>;
  const choices = <>
    <fieldset className={styles.fieldset}><legend>Choose your topics</legend><p className={styles.fieldNote}>Select at least one. You can change these whenever you like.</p><div className={styles.topics}>{signalTopics.map(topic => <label key={topic.id} className={selectedTopics.includes(topic.id) ? styles.selected : ''}><input type="checkbox" name="topics" value={topic.id} checked={selectedTopics.includes(topic.id)} onChange={() => chooseTopic(topic.id)} /><topic.icon size={19} aria-hidden="true" /><span>{topic.label}</span></label>)}</div></fieldset>
    <fieldset className={styles.fieldset}><legend>What would you like to read?</legend><div className={styles.radios}>{contentOptions.map(option => <label key={option.value} className={content === option.value ? styles.selected : ''}><input type="radio" name="content" value={option.value} checked={content === option.value} onChange={() => setContent(option.value)} /><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</div></fieldset>
    <fieldset className={styles.fieldset}><legend>How often?</legend><div className={styles.frequencies}><label className={frequency === 'weekly' ? styles.selected : ''}><input type="radio" name="frequency" value="weekly" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} /><span><strong>Weekly</strong><small>One roundup on Mondays</small></span></label><label className={frequency === 'daily' ? styles.selected : ''}><input type="radio" name="frequency" value="daily" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} /><span><strong>Daily</strong><small>One digest per day</small></span></label></div></fieldset>
  </>;

  if (loading || !tokenRead) return <section className={styles.state} aria-live="polite"><Mail size={25} aria-hidden="true" /><h2>Opening your Signal link.</h2><p>Checking your subscription preferences…</p></section>;
  if (mode === 'subscribe' && completed) return <section className={styles.state}><Mail size={27} aria-hidden="true" /><h2>One more step. Check your inbox.</h2>{feedback}<p>Open the confirmation link and confirm your choices to start receiving Signal. The link expires in 24 hours.</p><p>Until then, a new subscription is unconfirmed and existing delivery preferences stay as they were.</p><Link href="/news/briefs" className={styles.textLink}>Explore Signal briefs <ArrowRight size={17} /></Link></section>;
  if (mode === 'confirm') return <section className={styles.state}>{completed ? <><Check size={28} aria-hidden="true" /><h2>You’re subscribed.</h2><p>Signal will bring you {frequency === 'weekly' ? 'a weekly Monday roundup' : 'a daily digest'} when new articles match your choices.</p><p className={styles.privateEmail}>{preferences?.email}</p><Link href={`/news/preferences#token=${encodeURIComponent(managementToken)}`} className={styles.primary}>Manage your preferences <ArrowRight size={18} /></Link></> : <><Mail size={27} aria-hidden="true" /><h2>Make it official.</h2><p>Confirm that you want Signal emails for the topics and delivery schedule you selected.</p>{feedback}{token ? <button type="button" className={styles.primary} onClick={confirm} disabled={busy}>{busy ? 'Confirming…' : 'Confirm my subscription'}<ArrowRight size={18} /></button> : <p>Open the confirmation link from your email, or <Link href="/news/subscribe">request a new confirmation</Link>.</p>}</>}</section>;
  if (mode === 'unsubscribe' || (mode === 'preferences' && completed)) return <section className={styles.state}>{completed ? <><Check size={28} aria-hidden="true" /><h2>You’re unsubscribed.</h2><p>Future Signal digests have been stopped. You can subscribe again whenever you like.</p><Link href="/news" className={styles.textLink}>Back to the latest <ArrowRight size={17} /></Link></> : <><Mail size={27} aria-hidden="true" /><h2>Unsubscribe from Signal?</h2><p>Use the button below to stop Signal digests.</p>{feedback}{token ? <button type="button" className={styles.primary} onClick={unsubscribe} disabled={busy}>{busy ? 'Unsubscribing…' : 'Unsubscribe from Signal'}<ArrowRight size={18} /></button> : <p>Open the unsubscribe link from a Signal email, or <Link href="/news/preferences">request a preferences link</Link>.</p>}</>}</section>;
  if (mode === 'preferences' && !preferences) return <section className={styles.state}><Mail size={27} aria-hidden="true" /><h2>Your inbox. Your choices.</h2><p>Enter your subscription email to receive a private link for changing topics, delivery frequency, or pausing Signal.</p><form onSubmit={requestAccess} className={styles.accessForm}>{honeypot}<label className={styles.emailLabel}>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} /></label>{feedback}<button className={styles.primary} type="submit" disabled={busy}>{busy ? 'Requesting link…' : 'Email my preferences link'}<ArrowRight size={18} /></button></form></section>;

  return <div className={styles.layout}><details className={styles.mobilePreview}><summary><span><strong>Preview your Signal</strong><small>See how your choices shape a digest.</small></span><ArrowRight size={18} aria-hidden="true" /></summary><DigestPreview topics={selectedTopics} content={content} frequency={frequency} headingId="digest-preview-mobile-title" /></details><form onSubmit={mode === 'subscribe' ? subscribe : save} className={styles.form}>
    {honeypot}{mode === 'subscribe' ? <label className={styles.emailLabel}>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label> : <div className={styles.account}><p>Subscription email</p><strong>{preferences?.email}</strong><span>{preferences?.status === 'paused' ? 'Delivery paused' : 'Delivery active'}</span></div>}
    {choices}{mode === 'subscribe' && <label className={styles.consent}><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required /><span>Email me Signal updates based on these choices. I can change preferences or unsubscribe at any time. <Link href="/legal/privacy">Privacy policy</Link></span></label>}
    {feedback}<button type="submit" className={styles.primary} disabled={busy}>{busy ? (mode === 'subscribe' ? 'Requesting confirmation…' : 'Saving preferences…') : mode === 'subscribe' ? 'Send my confirmation email' : 'Save preferences'}<ArrowRight size={18} /></button>
    {mode === 'subscribe' && <p className={styles.caption}>Your subscription starts after you confirm your email. No password or payment is needed.</p>}
  </form><div className={styles.previewColumn}><div className={styles.desktopPreview}><DigestPreview topics={selectedTopics} content={content} frequency={frequency} /></div><aside className={styles.aside}><p className={styles.eyebrow}>SIGNAL / IN YOUR INBOX</p><h2>A little context.<br />Chosen by you.</h2><ul><li><Check size={16} />Stories that match your interests.</li><li><Check size={16} />Sources and reading links included.</li><li><Check size={16} />One digest with no repeated items.</li><li><Check size={16} />No email when there is nothing new.</li></ul>{mode === 'preferences' ? <div className={styles.controls}><button type="button" onClick={togglePause} disabled={busy}>{preferences?.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}{preferences?.status === 'paused' ? 'Resume Signal emails' : 'Pause Signal emails'}</button><button type="button" onClick={unsubscribe} disabled={busy}>Unsubscribe from Signal <ArrowRight size={16} /></button></div> : <><p>Choose Signal’s source digests, original OfRoot guides, or both. Every edition gives you a path back to the article and its evidence.</p><Link href="/news/preferences" className={styles.textLink}>Already subscribed? Manage preferences <ArrowRight size={16} /></Link></>}</aside></div></div>;
}
