'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { track } from '@/app/lib/ab';
import { HOUSTON_AC_FIELD_LIMITS as limits, HOUSTON_AC_OFFER as offer, HOUSTON_AC_ROLES as roles } from '@/app/lib/houston-rental-ac';
import styles from '@/components/growth/GrowthAuditForm.module.css';

function trackForm(action: string) {
  track({ category: 'form', action, label: offer.id, meta: { path: offer.path } });
}

export default function WorkflowReviewForm() {
  const started = useRef(false);
  const inFlight = useRef(false);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');

  useEffect(() => {
    if (state === 'success') confirmation.current?.focus();
  }, [state]);

  function start() {
    if (started.current) return;
    started.current = true;
    trackForm(offer.events.start);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    start();
    setState('submitting');

    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/sales-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, size: Number(fields.size), offer: offer.id }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Request was not saved');
      trackForm(offer.events.submit);
      setState('success');
    } catch {
      setState('error');
    } finally {
      inFlight.current = false;
    }
  }

  if (state === 'success') {
    return (
      <div className={styles.success}>
        <h3 className={styles.formTitle} ref={confirmation} tabIndex={-1}>We received your request.</h3>
        <p className={styles.successDescription}>OfRoot will review your workflow and follow up by email about a time to talk.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} aria-labelledby="review-heading" onChange={start} onSubmit={submit}>
      <div className={styles.fields}>
        <label className={styles.label}>
          Your role
          <select className={styles.input} name="role" defaultValue="" required>
            <option value="" disabled>Select your role</option>
            {Object.entries(roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.label}>
          Company
          <input className={styles.input} name="company" autoComplete="organization" maxLength={limits.company} required />
        </label>
        <label className={styles.label}>
          Work email
          <input className={styles.input} name="email" type="email" autoComplete="email" maxLength={limits.email} required />
        </label>
        <label className={styles.label}>
          Number of properties or service vehicles
          <input className={styles.input} name="size" type="number" inputMode="numeric" min="1" max={limits.size} required />
        </label>
        <label className={`${styles.label} ${styles.fullWidth}`}>
          Current software
          <input className={styles.input} name="software" maxLength={limits.software} placeholder="Portal, spreadsheet, or none" required />
        </label>
        <label className={`${styles.label} ${styles.fullWidth}`}>
          Biggest workflow bottleneck
          <textarea className={`${styles.input} ${styles.textarea}`} name="bottleneck" maxLength={limits.bottleneck} placeholder="For example, work orders stall while we wait for approval" required />
        </label>
      </div>
      {state === 'error' && <p className={styles.error} role="alert">We couldn’t save your request. Please try again. Your answers are still here.</p>}
      <button className={styles.submit} type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending your request…' : 'Request my workflow review'}
      </button>
      <p className={styles.privacy}>Please share business details only. Read our <Link className="underline" href="/legal/privacy">privacy policy</Link>.</p>
    </form>
  );
}
