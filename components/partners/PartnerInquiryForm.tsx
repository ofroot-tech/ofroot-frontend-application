'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { partnerAttribution } from '@/app/lib/partner-inquiry';
import { partnerEvent } from './PartnerAnalytics';
import styles from '@/components/growth/GrowthAuditForm.module.css';
import extra from './PartnerInquiryForm.module.css';

export default function PartnerInquiryForm({ enabled = false, intent = 'partnership' }: { enabled?: boolean; intent?: 'partnership' | 'security' }) {
  const isSecurity = intent === 'security';
  const [state, setState] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const started = useRef(false);
  const pending = useRef(false);
  const attempt = useRef<{ content: string; id: string } | null>(null);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === 'success' || state === 'error') feedback.current?.focus();
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !enabled) return;
    pending.current = true;
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get('name') || '').trim(), email: String(data.get('email') || '').trim(),
      company: String(data.get('company') || '').trim(), partnerType: data.get('partnerType'), need: data.get('need'),
      description: `${isSecurity ? 'Application security inquiry: ' : ''}${String(data.get('description') || '').trim()}`, timeframe: data.get('timeframe'),
      budget: String(data.get('budget') || '').trim(), consent: data.get('consent') === 'on',
      website: String(data.get('website') || ''), attribution: partnerAttribution(new URLSearchParams(window.location.search)),
    };
    const content = JSON.stringify(values);
    if (!attempt.current || attempt.current.content !== content) attempt.current = { content, id: crypto.randomUUID() };
    setState('submitting'); setError('');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('/api/partner-inquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ requestId: attempt.current.id, ...values }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true || typeof result.requestId !== 'string') {
        throw new Error(result.error || 'Your inquiry could not be saved. Please try again.');
      }
      setReference(result.requestId); setState('success');
      partnerEvent('partner_form_submit');
    } catch (caught) {
      setError(caught instanceof Error && caught.name !== 'AbortError' ? caught.message : 'We could not confirm receipt. Please try again; your answers are still here.');
      setState('error');
    } finally { window.clearTimeout(timer); pending.current = false; }
  }

  if (!enabled) return <div className={styles.form}>
    <h3 className={styles.formTitle}>Start a conversation</h3>
    <p className={styles.formDescription}>{isSecurity ? 'Online security inquiries are temporarily unavailable. Please return later to request a scoped conversation.' : 'Use our project form to tell us about the role or project, the skills you need and your preferred start date.'}</p>
    {!isSecurity && <Link className={styles.submit} href="/book?source=staffing-partnership">Discuss a partnership</Link>}
  </div>;

  return <form className={styles.form} onSubmit={submit} aria-busy={state === 'submitting'} onFocus={() => {
    if (!started.current) { started.current = true; partnerEvent('partner_form_start'); }
  }} aria-labelledby="partner-form-heading">
    <div className={styles.formHeader}>
      <p className={styles.formEyebrow}>{isSecurity ? 'Application security inquiry' : 'Engineering partnership inquiry'}</p>
      <h3 id="partner-form-heading" className={styles.formTitle}>{isSecurity ? 'Tell us what you need reviewed.' : 'Tell us about the role or project.'}</h3>
      <p className={styles.formDescription}>Required fields are marked *. Please leave out passwords and sensitive client information.</p>
    </div>
    <fieldset disabled={state === 'submitting' || state === 'success'} className={extra.fieldset} hidden={state === 'success'}>
      <legend className="sr-only">Your contact and engineering needs</legend>
      <div className={styles.fields}>
        <label className={styles.label}>Your name *<input name="name" autoComplete="name" required maxLength={100} className={styles.input} /></label>
        <label className={styles.label}>Work email *<input name="email" type="email" autoComplete="email" required maxLength={254} className={styles.input} /></label>
        <label className={`${styles.label} ${styles.fullWidth}`}>Company *<input name="company" autoComplete="organization" required maxLength={160} className={styles.input} /></label>
        <label className={styles.label}>You represent *<select name="partnerType" required defaultValue="" className={styles.input}>
          <option value="" disabled>Select one</option><option value="staffing">Staffing or recruiting firm</option><option value="consultancy">Delivery consultancy</option><option value="direct">Direct client</option><option value="other">Other</option>
        </select></label>
        <label className={styles.label}>Engineering need *<select name="need" required defaultValue={isSecurity ? 'project' : ''} className={styles.input}>
          <option value="" disabled>Select one</option><option value="embedded">Embedded senior engineer / lead</option><option value="managed">Managed engineering delivery</option><option value="project">{isSecurity ? 'Security review or penetration test' : 'Defined project or integration'}</option>
        </select></label>
        <label className={`${styles.label} ${styles.fullWidth}`}>What needs to be delivered? *<textarea name="description" required minLength={20} maxLength={isSecurity ? 2970 : 3000} className={`${styles.input} ${styles.textarea}`} aria-describedby="partner-description-help" placeholder={isSecurity ? 'Describe the application, your assessment goal and whether you need help fixing findings. Leave out credentials and sensitive evidence.' : 'Tell us about the work, the team it supports and the result you need.'} /><span id="partner-description-help" className={extra.hint}>20–{isSecurity ? '2,970' : '3,000'} characters.</span></label>
        <label className={`${styles.label} ${styles.fullWidth}`}>Target start timeframe *<select name="timeframe" required defaultValue="" className={styles.input}>
          <option value="" disabled>Select one</option><option value="within-month">Within a month</option><option value="one-three-months">In 1–3 months</option><option value="planning">Planning ahead</option><option value="unsure">Not sure yet</option>
        </select></label>
      </div>
      <details className={styles.context}><summary className={styles.contextSummary}>Add a budget or rate range <span>(optional)</span></summary>
        <div className={styles.contextFields}><label className={styles.label}>Budget or rate range<input name="budget" maxLength={120} className={styles.input} placeholder="Include currency and hourly, monthly or project basis" /></label></div>
      </details>
      <div className={extra.honeypot} aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
      <label className={extra.consent}><input name="consent" type="checkbox" required /><span>I understand OfRoot will use these details to review and respond to this inquiry. *</span></label>
      <p className={styles.formDescription}>Read our <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className={extra.link}>privacy notice (opens in a new tab)</Link>. This does not subscribe you to marketing.</p>
      <button type="submit" className={styles.submit} disabled={state === 'submitting'}>{state === 'submitting' ? 'Saving your inquiry…' : isSecurity ? 'Send security inquiry' : 'Send partnership inquiry'}</button>
    </fieldset>
    <div ref={feedback} tabIndex={-1} className={extra.feedback}>
      {state === 'error' && <p role="alert" className={styles.error}>{error}</p>}
      {state === 'success' && <div role="status" className={extra.receipt}>
        <h3 className={styles.formTitle}>Your inquiry is saved.</h3>
        <p className={styles.successDescription}>Keep this reference: <strong>{reference}</strong></p>
        <p className={styles.successDescription}>We’ll review the details before discussing next steps with you.</p>
      </div>}
    </div>
    <p className={styles.privacy}>We’ll agree the scope and terms together before work begins.</p>
  </form>;
}
