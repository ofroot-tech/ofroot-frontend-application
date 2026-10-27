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
      <p className="mt-3 text-sm text-[#b4a3c5]">Last updated: February 17, 2026</p>
    </div></main>
  );
}

