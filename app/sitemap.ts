import type { MetadataRoute } from 'next'
import landing from '@/app/landing/manifest.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://ofroot.technology'
  const now = new Date().toISOString()
  // Static top-level routes; dynamic can be added later from CMS/API
  const routes = [
    '',
    '/automations',
    '/hubspot-integration',
    '/meta-conversions-api',
    '/make-zapier-automation',
    '/agent-integrations',
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
    '/blog',
    '/case-studies',
    '/docs/brand-guide',
    '/ontask',
  ]

  const landingSlugs = Object.keys((landing as any).pages || {});
  for (const slug of landingSlugs) routes.push(`/landing/${slug}`);

  const uniqueRoutes = Array.from(new Set(routes));
  return uniqueRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
