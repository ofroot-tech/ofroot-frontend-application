import styles from '@/components/growth/PublicPage.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for OfRoot services and websites.',
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className={`${styles.page} ${styles.legacy} ${styles.legal}`}><div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-[#faf9fc]">Privacy Policy</h1>
      <p className="mt-4 text-[#c9bed5]">
        OfRoot collects only the data needed to provide services, respond to inquiries,
        and operate products securely. We do not sell customer data.
      </p>
      <p className="mt-3 text-[#c9bed5]">
        If you submit forms, we use your details to communicate about your request.
        For privacy-related requests, contact{' '}
        <a className="underline" href="mailto:communications@ofroot.technology">communications@ofroot.technology</a>.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-[#faf9fc]">Signal email subscriptions</h2>
      <p className="mt-3 text-[#c9bed5]">If you subscribe to Signal, we store your email address, selected topics, content and frequency preferences, confirmation and consent records, and delivery history. We use these to send the digests you request, avoid repeated articles, and honor pauses and unsubscribe requests. A subscription begins after you confirm your email address.</p>
      <p className="mt-3 text-[#c9bed5]">Subscription records are stored in our Neon Postgres database and email is delivered through Resend. We retain delivery and suppression records to prevent repeat sends and respect opt-outs. Security rate limits use hashed email and network identifiers. Unconfirmed signups expire and are removed after seven days; stale rate-limit records are removed after two days during subsequent requests.</p>
      <p className="mt-3 text-[#c9bed5]">You can change your topics and frequency, pause delivery, or unsubscribe through a private email link without creating an account. Signal subscription forms and private confirmation, preferences, and unsubscribe pages are excluded from our site analytics. For deletion or other privacy requests, contact the address above.</p>
      <p className="mt-3 text-sm text-[#b4a3c5]">Last updated: October 28, 2026</p>
    </div></main>
  );
}

