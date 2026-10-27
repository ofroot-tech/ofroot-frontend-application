import styles from '@/components/growth/PublicPage.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for OfRoot websites and services.',
};

export default function TermsPage() {
  return (
    <main id="main-content" className={`${styles.page} ${styles.legacy} ${styles.legal}`}><div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-[#faf9fc]">Terms of Service</h1>
      <p className="mt-4 text-[#c9bed5]">
        By using OfRoot sites and services, you agree to lawful use, responsible account handling,
        and accurate information in submitted forms.
      </p>
      <p className="mt-3 text-[#c9bed5]">
        Service scope, pricing, and delivery details are governed by signed proposals or subscription terms where applicable.
      </p>
      <p className="mt-3 text-[#c9bed5]">
        Questions about terms can be sent to{' '}
        <a className="underline" href="mailto:communications@ofroot.technology">communications@ofroot.technology</a>.
      </p>
      <p className="mt-3 text-sm text-[#b4a3c5]">Last updated: February 17, 2026</p>
    </div></main>
  );
}

