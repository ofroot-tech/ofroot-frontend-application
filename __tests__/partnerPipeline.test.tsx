import { renderToStaticMarkup } from 'react-dom/server';
import SalesInquiryQueue from '@/app/dashboard/owner/funnel/SalesInquiryQueue';
import type { SalesInquiryRecord } from '@/app/lib/supabase-store';

it('shows engineering context in the existing owner queue without losing legacy request text', () => {
  const common = { id: 1, name: 'Synthetic QA', email: 'qa@example.test', business_name: 'Synthetic Staffing', business_formation_status: null, llc_upsell_opportunity: false, created_at: '2026-11-16T12:00:00.000Z' };
  const items: SalesInquiryRecord[] = [
    { ...common, payload: { message: 'Synthetic API modernization', requestId: 'synthetic-reference', form: { form_type: 'engineering_partnership', need: 'embedded', partnerType: 'staffing', timeframe: 'planning', budget: 'To discuss', utm: { source: 'synthetic-staffing-referral' } } } },
    { ...common, id: 2, payload: { form: { growthBottleneck: 'Reporting', desiredOutcome: 'Legacy report workflow' } } },
  ];
  const html = renderToStaticMarkup(<SalesInquiryQueue initialItems={items} />);
  for (const value of ['Engineering: embedded', 'Synthetic API modernization', 'synthetic-reference', 'synthetic-staffing-referral', 'Legacy report workflow', 'Reporting', 'unsent drafts requiring founder approval']) expect(html).toContain(value);
});
