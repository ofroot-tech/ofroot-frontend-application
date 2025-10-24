import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://ofroot.technology'
  const now = new Date().toISOString()
  // Static top-level routes; dynamic can be added later from CMS/API
  const routes = [
    '',
    '/services',
    '/services/ai-audit',
    '/services/ai-development-integrations',
    '/services/marketing-automation',
    '/services/development-automation',
    '/services/website-app-development',
    '/blog',
    '/case-studies',
    '/docs/brand-guide',
    '/ontask',
  ]
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
