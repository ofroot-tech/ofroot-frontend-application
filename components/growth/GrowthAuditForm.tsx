'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { track } from '@/app/lib/ab';
import styles from './GrowthAuditForm.module.css';

export default function GrowthAuditForm() {
  const started = useRef(false);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const isHomeServices = focus === 'home-services-automation';
  useEffect(() => {
    setFocus(new URLSearchParams(window.location.search).get('focus'));
  }, []);
  const start = () => {
    if (started.current) return;
    started.current = true;
    track({ category: 'form', action: 'booking_form_started', label: isHomeServices ? 'home_services_workflow_audit' : 'growth_systems_audit', meta: { path: window.location.pathname, focus } });
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting'); setMessage('');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const params = new URLSearchParams(window.location.search);
    const payload = {
      ...data,
      ctaSource: params.get('source') || params.get('focus') || 'direct',
      referringPage: document.referrer || 'direct',
      landingPage: window.location.pathname,
      utm: {
        source: params.get('utm_source') || null,
        medium: params.get('utm_medium') || null,
        campaign: params.get('utm_campaign') || null,
        content: params.get('utm_content') || null,
        term: params.get('utm_term') || null,
      },
    };
    try {
      const response = await fetch('/api/sales-inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.businessName, email: data.email, message: `Growth Systems Audit: ${data.desiredOutcome}`, businessName: data.businessName, payload }) });
      if (!response.ok) throw new Error('The request could not be saved.');
      track({ category: 'form', action: 'booking_form_submitted', label: isHomeServices ? 'home_services_workflow_audit' : 'growth_systems_audit', meta: { ctaSource: payload.ctaSource, focus, path: window.location.pathname } });
      setState('success');
    } catch (error) {
      setState('error'); setMessage(error instanceof Error ? error.message : 'Please try again.');
    }
  }
  if (state === 'success') return <div className={styles.success} role="status"><CheckCircle2 className={styles.successIcon} aria-hidden="true" /><h2 className={styles.formTitle}>{isHomeServices ? 'Your workflow-audit request is in.' : 'Your project request is in.'}</h2><p className={styles.successDescription}>We will review the bottleneck and reply by email with the recommended next step and scheduling details when there is a useful fit.</p></div>;
  const input = styles.input;
  return <form onSubmit={submit} onFocus={start} className={styles.form} aria-describedby={message ? 'form-error' : undefined}>
    <div className={styles.formHeader}>
      <p className={styles.formEyebrow}>{isHomeServices ? 'Home-services workflow audit' : 'Project request'}</p>
      <h2 className={styles.formTitle}>{isHomeServices ? 'Map the path from lead to payment.' : 'Tell us what needs to work better.'}</h2>
      <p className={styles.formDescription}>{isHomeServices ? 'Tell us where intake, scheduling, follow-up, invoicing, or payment gets stuck.' : 'Four answers are required. Everything under “Add helpful context” is optional.'}</p>
    </div>
    <div className={styles.fields}>
      <label className={styles.label}>Business name <span className={styles.required}>*</span><input className={input} name="businessName" required autoComplete="organization" /></label>
      <label className={styles.label}>Contact email <span className={styles.required}>*</span><input className={input} name="email" type="email" required autoComplete="email" /></label>
      <label className={`${styles.label} ${styles.fullWidth}`}>Main growth bottleneck <span className={styles.required}>*</span><select key={isHomeServices ? 'home-services' : 'general'} className={input} name="growthBottleneck" required defaultValue={isHomeServices ? 'Automation' : ''}><option value="" disabled>Select one</option><option>Discoverability</option><option>Lead conversion</option><option>Automation</option><option>Internal knowledge</option><option>Private AI</option><option>Reporting</option><option>Not sure yet</option></select></label>
      <label className={`${styles.label} ${styles.fullWidth}`}>Desired outcome <span className={styles.required}>*</span><textarea className={`${input} ${styles.textarea}`} name="desiredOutcome" required placeholder={isHomeServices ? 'For example: respond faster to new calls, book more jobs, or close the loop on estimates and invoices.' : 'What should work better after this engagement?'} /></label>
    </div>
    <details className={styles.context}>
      <summary className={styles.contextSummary}>Add helpful context <span>(optional)</span></summary>
      <div className={`${styles.fields} ${styles.contextFields}`}>
        <label className={`${styles.label} ${styles.fullWidth}`}>Current website<input className={input} name="website" type="url" placeholder="https://" autoComplete="url" /></label>
        <label className={styles.label}>Monthly lead volume<select className={input} name="monthlyLeadVolume" defaultValue=""><option value="">Not sure</option><option>Under 100</option><option>100–500</option><option>501–2,000</option><option>More than 2,000</option></select></label>
        <label className={styles.label}>Team size<select className={input} name="teamSize" defaultValue=""><option value="">Select</option><option>1–10</option><option>11–50</option><option>51–200</option><option>201+</option></select></label>
        <label className={`${styles.label} ${styles.fullWidth}`}>Systems currently used<input className={input} name="systems" placeholder="For example: HubSpot, Slack, Google Drive" /></label>
        <label className={styles.label}>Timeline<select className={input} name="timeline" defaultValue=""><option value="">Flexible</option><option>Within 30 days</option><option>1–3 months</option><option>3–6 months</option><option>Planning ahead</option></select></label>
        <label className={styles.label}>Budget range<select className={input} name="budget" defaultValue=""><option value="">Prefer to discuss</option><option>Under $10,000</option><option>$10,000–$25,000</option><option>$25,000–$75,000</option><option>$75,000+</option></select></label>
      </div>
    </details>
    {message && <p id="form-error" className={styles.error} role="alert">{message}</p>}
    <button type="submit" disabled={state === 'submitting'} className={styles.submit}>{state === 'submitting' && <Loader2 className={styles.spinner} aria-hidden="true" />}{isHomeServices ? 'Request a workflow audit' : 'Send project request'}</button>
    <p className={styles.privacy}>No payment is collected. We use this information only to review and respond to your request.</p>
  </form>;
}
