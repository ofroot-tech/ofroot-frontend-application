import { Metadata } from 'next';
import HomeTrackedLink from '@/components/home/HomeTrackedLink';
import HomeViewPing from '@/components/home/HomeViewPing';

export const metadata: Metadata = {
  title: 'OfRoot — Automation Integrations for Leads, Meetings, and Pipelines',
  description: 'We build HubSpot, Meta, Make, Zapier, and API automations that convert engagement into booked meetings, clean leads, and reliable pipeline data.',
  keywords: ['automation integrations', 'HubSpot lead routing', 'Meta API integration', 'Make automation', 'Zapier workflows', 'pipeline automation'],
  openGraph: {
    title: 'OfRoot — Automation Integrations for Leads, Meetings, and Pipelines',
    description: 'Automation systems for lead capture, booking workflows, and data pipeline reliability.',
    url: 'https://ofroot.technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ofroot_tech',
    creator: '@ofroot_tech',
  },
};

export default function HomePage() {
  return (
    <main className="w-full bg-white">
      <HomeViewPing />
      <section className="surface-dark bg-[#071225] px-6 pb-16 pt-28 text-white sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFC46B]">
            Revenue automation systems
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Book more qualified meetings from the traffic you already have.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-slate-200 sm:text-xl">
            We build and operate HubSpot, Meta, Make, and API automations that cut lead response
            time, fix routing gaps, and keep your pipeline data reliable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <HomeTrackedLink
              href="/consulting/book"
              label="book_20_min_audit"
              placement="hero_primary"
              className="rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A]"
            >
              Book a 20-minute automation audit
            </HomeTrackedLink>
            <HomeTrackedLink
              href="/case-studies"
              label="see_case_studies"
              placement="hero_secondary"
              className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              See case studies
            </HomeTrackedLink>
          </div>

          <div className="mt-8 grid gap-3 rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-slate-200 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Typical response speed</p>
              <p className="mt-1 font-semibold text-white">&lt; 2 minutes on qualified triggers</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Lead quality impact</p>
              <p className="mt-1 font-semibold text-white">+31% qualified lead rate</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Pipeline reliability</p>
              <p className="mt-1 font-semibold text-white">99.9% monitored handoff uptime</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              Trusted stack coverage: HubSpot, Meta Ads + CAPI, Make, Zapier, webhooks, and internal APIs.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              "OfRoot helped us stop dropped leads and speed up follow-up in week one."
            </p>
          </div>

          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Pick your integration</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Choose the path that matches your bottleneck. Every engagement is scoped to improve
            meetings booked, lead quality, and reporting confidence.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <HomeTrackedLink
              href="/services/hubspot-meta-integrations"
              label="hubspot_meta_service"
              placement="service_grid"
              action="home_service_click"
              className="rounded-xl border border-slate-200 p-6 hover:border-[#FF9312] hover:bg-[#FFF7ED]"
            >
              <h3 className="text-xl font-semibold text-slate-900">HubSpot + Meta lead integrations</h3>
              <p className="mt-2 text-sm text-slate-600">Capture comments, DMs, and forms, then route qualified leads into HubSpot with clean lifecycle stages and ownership.</p>
            </HomeTrackedLink>
            <HomeTrackedLink
              href="/services/workflow-automation"
              label="workflow_automation_service"
              placement="service_grid"
              action="home_service_click"
              className="rounded-xl border border-slate-200 p-6 hover:border-[#FF9312] hover:bg-[#FFF7ED]"
            >
              <h3 className="text-xl font-semibold text-slate-900">Workflow automation (Make, Zapier, API)</h3>
              <p className="mt-2 text-sm text-slate-600">Build stable automations for follow-up, reminders, qualification, and meeting handoffs across your stack.</p>
            </HomeTrackedLink>
            <HomeTrackedLink
              href="/services/data-pipeline-sanity"
              label="data_pipeline_sanity_service"
              placement="service_grid"
              action="home_service_click"
              className="rounded-xl border border-slate-200 p-6 hover:border-[#FF9312] hover:bg-[#FFF7ED]"
            >
              <h3 className="text-xl font-semibold text-slate-900">Data sanity and pipeline reliability</h3>
              <p className="mt-2 text-sm text-slate-600">Fix duplicates, dropped events, and broken mappings so reporting and attribution reflect reality.</p>
            </HomeTrackedLink>
            <HomeTrackedLink
              href="/services/llm-agent-integrations"
              label="llm_agent_service"
              placement="service_grid"
              action="home_service_click"
              className="rounded-xl border border-slate-200 p-6 hover:border-[#FF9312] hover:bg-[#FFF7ED]"
            >
              <h3 className="text-xl font-semibold text-slate-900">LLM and agent integrations</h3>
              <p className="mt-2 text-sm text-slate-600">Add agent workflows with approval gates and data controls to automate repetitive sales and ops tasks safely.</p>
            </HomeTrackedLink>
          </div>
          <div className="mt-8">
            <HomeTrackedLink
              href="/consulting/book"
              label="book_20_min_audit_after_services"
              placement="services_section_cta"
              className="inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Book a 20-minute automation audit
            </HomeTrackedLink>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Common problems we fix</h2>
          <ul className="mt-6 space-y-3 text-slate-700">
            <li>• Dropped, duplicated, or delayed leads between Meta, forms, and HubSpot.</li>
            <li>• Broken workflow automations that silently fail after launch.</li>
            <li>• Slow follow-up that kills meeting conversion.</li>
            <li>• Pipeline and attribution data that cannot be trusted.</li>
          </ul>
          <div className="mt-8">
            <HomeTrackedLink
              href="/consulting/book"
              label="book_20_min_audit_final"
              placement="final_problem_section_cta"
              className="inline-flex rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A]"
            >
              Get a scoped implementation plan
            </HomeTrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
