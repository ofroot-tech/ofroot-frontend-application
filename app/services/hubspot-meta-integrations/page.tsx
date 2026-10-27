import publicStyles from '@/components/growth/PublicPage.module.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HubSpot + Meta Integrations | OfRoot',
  description:
    'Lead capture and routing integrations across Meta comments, DMs, forms, and HubSpot lifecycle workflows.',
  alternates: { canonical: '/services/hubspot-meta-integrations' },
};

export default function HubSpotMetaIntegrationsPage() {
  return (
    <main className={`${publicStyles.page} ${publicStyles.legacy} bg-[#211c2c] px-6 pb-16 pt-28 sm:px-8 sm:pt-32`}>
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex rounded-[2px] border border-[#b4a0ef]/30 bg-[#30263d] px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#c4abe3]">
          Pillar 01
        </p>
        <h1 className="mt-4 text-4xl font-medium leading-tight text-[#faf9fc] sm:text-5xl">
          HubSpot + Meta integrations for lead-to-meeting flow.
        </h1>
        <p className="mt-4 max-w-3xl text-[#c0b5cc]">
          We connect Meta comments, DMs, and lead forms to HubSpot with qualification rules, owner assignment, and lifecycle stage accuracy.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2px] border border-[#d2caeb]/16 p-6">
            <h2 className="text-xl font-semibold text-[#faf9fc]">What we implement</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#c9bed5]">
              <li>• Comment keyword triggers and DM response flows</li>
              <li>• Lead object mapping and enrichment before CRM write</li>
              <li>• HubSpot lifecycle + owner routing logic</li>
              <li>• Alerts when sync fails or SLA is breached</li>
            </ul>
          </div>
          <div className="rounded-[2px] border border-[#d2caeb]/16 p-6">
            <h2 className="text-xl font-semibold text-[#faf9fc]">Outcome focus</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#c9bed5]">
              <li>• Faster first response to inbound engagement</li>
              <li>• Higher booking rate from social lead sources</li>
              <li>• Cleaner lifecycle stages and reporting consistency</li>
              <li>• Reliable handoff from marketing to sales</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/consulting/book" className="rounded-md bg-[#574064] px-5 py-3 text-sm font-semibold text-[#faf9fc] hover:bg-[#6d4c70]">
            Book an integration call
          </Link>
          <Link href="/pricing" className="rounded-md border border-[#6d617f] px-5 py-3 text-sm font-semibold text-[#faf9fc] hover:bg-[#262231]">
            See pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
