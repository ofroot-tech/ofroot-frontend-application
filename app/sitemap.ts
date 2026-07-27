import type { MetadataRoute } from 'next'
import landing from '@/app/landing/manifest.json'
import { CANONICAL_SITE_URL } from '@/app/config/site'
import { insights } from '@/app/lib/insights-content'
import { featurePages, featurePath } from '@/app/lib/feature-content'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = CANONICAL_SITE_URL
  const now = new Date().toISOString()
  // Static top-level routes; dynamic can be added later from CMS/API
  const routes = [
    '',
    '/automations',
    '/hubspot-integration',
    '/meta-conversions-api',
    '/make-zapier-automation',
    '/agent-integrations',
    '/gpu-llm-training',
    '/services',
    '/services/automation',
    '/services/integration',
    '/services/ai-audit',
    '/services/ai-development-integrations',
    '/services/marketing-automation',
    '/services/development-automation',
    '/services/website-app-development',
    '/services/stability',
    '/services/growth-systems',
    '/services/ai-discoverability',
    '/services/automation-systems',
    '/services/private-company-ai',
    '/solutions/generate-demand',
    '/solutions/convert-more-leads',
    '/solutions/unlock-company-knowledge',
    '/results',
    '/pricing',
    '/security',
    '/insights',
    '/book',
    '/demo/private-ai',
    '/blog',
    '/case-studies/home-services-mvp',
    '/case-studies/crm-erp-sync',
    '/case-studies/healthcare-ai-automation',
    '/docs/brand-guide',
    '/platform',
    '/helpr',
    '/ontask',
  ]

  const landingSlugs = Object.keys((landing as any).pages || {});
  for (const slug of landingSlugs) routes.push(`/landing/${slug}`);
  for (const insight of insights) routes.push(`/insights/${insight.slug}`);
  for (const feature of featurePages) routes.push(featurePath(feature));

  const uniqueRoutes = Array.from(new Set(routes));
  return uniqueRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
