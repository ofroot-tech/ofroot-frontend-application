import type { MetadataRoute } from 'next'
import { CANONICAL_SITE_URL } from '@/app/config/site'
import { insights } from '@/app/lib/insights-content'
import { featurePages, featurePath } from '@/app/lib/feature-content'
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide'
import { SECURITY_GUIDE, SECURITY_NEWS, SECURITY_SERVICE_PATH } from '@/app/lib/application-security-content'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = CANONICAL_SITE_URL
  // Dates reflect substantive source changes and must be updated intentionally.
  const routes: Array<{ path: string; lastModified: string }> = [
    { path: '', lastModified: '2026-11-16' },
    { path: '/partners/staffing', lastModified: '2026-11-16' },
    { path: '/automations', lastModified: '2026-08-07' },
    { path: '/ai-process', lastModified: '2026-08-07' },
    { path: '/hubspot-integration', lastModified: '2026-02-09' },
    { path: '/meta-conversions-api', lastModified: '2026-02-09' },
    { path: '/make-zapier-automation', lastModified: '2026-02-09' },
    { path: '/agent-integrations', lastModified: '2026-09-08' },
    { path: '/ai-agent-readiness-assessment', lastModified: '2026-09-09' },
    { path: '/research/ai-agent-readiness-methodology', lastModified: '2026-09-09' },
    { path: '/authors/ofroot-technology', lastModified: '2026-09-09' },
    { path: '/about/editorial-standards', lastModified: '2026-09-09' },
    { path: '/gpu-llm-training', lastModified: '2026-02-11' },
    { path: '/services', lastModified: '2026-11-17' },
    { path: SECURITY_SERVICE_PATH, lastModified: '2026-11-17' },
    { path: '/services/ai-audit', lastModified: '2026-09-11' },
    { path: '/services/hubspot-meta-integrations', lastModified: '2026-03-05' },
    { path: '/services/workflow-automation', lastModified: '2026-03-05' },
    { path: '/services/data-pipeline-sanity', lastModified: '2026-03-05' },
    { path: '/services/ai-discoverability', lastModified: '2026-10-14' },
    { path: '/services/automation-systems', lastModified: '2026-10-14' },
    { path: '/services/private-company-ai', lastModified: '2026-10-14' },
    { path: '/clinic-success', lastModified: '2026-08-16' },
    { path: '/solutions/generate-demand', lastModified: '2026-09-11' },
    { path: '/solutions/convert-more-leads', lastModified: '2026-09-11' },
    { path: '/solutions/home-services-automation', lastModified: '2026-10-14' },
    { path: '/solutions/hvac-lead-follow-up-automation', lastModified: '2026-10-14' },
    { path: '/solutions/unlock-company-knowledge', lastModified: '2026-09-11' },
    { path: '/results', lastModified: '2026-10-14' },
    { path: '/pricing', lastModified: '2026-09-11' },
    { path: '/security', lastModified: '2026-07-22' },
    { path: '/insights', lastModified: '2026-09-09' },
    { path: '/news', lastModified: '2026-10-29' },
    { path: '/news/briefs', lastModified: '2026-10-29' },
    { path: '/news/from-ofroot', lastModified: '2026-11-07' },
    { path: '/news/stories', lastModified: '2026-10-29' },
    { path: '/news/sources', lastModified: '2026-10-29' },
    { path: '/news/methodology', lastModified: '2026-10-29' },
    { path: '/book', lastModified: '2026-10-14' },
    { path: '/demo/private-ai', lastModified: '2026-07-22' },
    { path: '/blog', lastModified: '2026-11-17' },
    { path: SECURITY_GUIDE.href, lastModified: SECURITY_GUIDE.publishedAt },
    { path: SECURITY_NEWS.href, lastModified: SECURITY_NEWS.publishedAt },
    { path: AI_PROCESS_GUIDE.href, lastModified: AI_PROCESS_GUIDE.publishedAt },
    { path: '/case-studies/home-services-mvp', lastModified: '2026-10-14' },
    { path: '/case-studies/crm-erp-sync', lastModified: '2026-10-14' },
    { path: '/case-studies/healthcare-ai-automation', lastModified: '2026-10-14' },
    { path: '/case-studies/reporting-reconciliation', lastModified: '2026-10-14' },
    { path: '/case-studies/marketing-websites', lastModified: '2026-10-14' },
    { path: '/platform', lastModified: '2026-04-06' },
  ]

  for (const insight of insights) {
    routes.push({
      path: `/insights/${insight.slug}`,
      lastModified: insight.modified ?? insight.published ?? '2026-07-22',
    })
  }
  for (const feature of featurePages) {
    routes.push({ path: featurePath(feature), lastModified: '2026-09-11' })
  }

  const uniqueRoutes = Array.from(new Map(routes.map((route) => [route.path, route])).values())
  return uniqueRoutes.map(({ path, lastModified }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
