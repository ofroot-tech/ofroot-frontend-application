import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PageHeader, Card, CardBody, ToolbarButton } from '@/app/dashboard/_components/UI';
import { AiWorkspacePanel } from '@/app/dashboard/blog/_components/AiWorkspacePanel';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { hasCompetitiveAnalysisAccess } from '@/app/lib/plans';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { CrawlIntelligencePanel } from './CrawlIntelligencePanel';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function CompetitiveAnalysisPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await getUserFromSessionToken(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const hasAccess = hasCompetitiveAnalysisAccess(me);

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Competitive Analysis"
        subtitle="Use your own crawl signals as truth, then benchmark against modeled competitor behavior without pretending the guesswork is certainty."
        actions={
          hasAccess ? (
            <ToolbarButton href="/dashboard/overview">Back to overview</ToolbarButton>
          ) : (
            <ToolbarButton href="/pricing">Upgrade to unlock</ToolbarButton>
          )
        }
      />

      {hasAccess ? (
        <>
          <AiWorkspacePanel description="Bring your own API key. This key powers crawl intelligence benchmarks and competitive modeling across your dashboard workspace." />
          <CrawlIntelligencePanel />
        </>
      ) : (
        <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(145deg,rgba(255,247,237,1),rgba(255,255,255,1)_60%,rgba(240,249,255,0.9))]">
          <CardBody className="space-y-6 p-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                Paid plans only
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-950">Turn crawl logs into a competitive edge</h2>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  This workspace combines your real crawl behavior with modeled competitor patterns so you can spot crawl waste, benchmark recrawl speed, and prioritize fixes with a stronger ROI story.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <PreviewCard
                title="Your crawl reality"
                body="Use first-party log metrics like recrawl cadence, discovery speed, and crawl waste as the baseline truth."
              />
              <PreviewCard
                title="Competitor model"
                body="Compare your site against directional competitor estimates shaped by market context, content velocity, and search patterns."
              />
              <PreviewCard
                title="Insights engine"
                body="Surface the gaps that matter most, then turn them into fixes your team can ship and report on."
              />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-950">Unlock with Pro or Business</div>
                <p className="text-sm text-gray-600">Ideal for teams that want log-grounded SEO insight inside the dashboard instead of another spreadsheet or vague audit deck.</p>
              </div>
              <div className="flex gap-2">
                <ToolbarButton href="/pricing">See plans</ToolbarButton>
                <ToolbarButton href="/services/marketing-automation">Explore service</ToolbarButton>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function PreviewCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-white/85 p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-gray-700">{body}</p>
    </div>
  );
}
