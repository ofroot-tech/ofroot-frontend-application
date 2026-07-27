import type { MetadataRoute } from 'next'
import { CANONICAL_SITE_URL } from '@/app/config/site'

export default function robots(): MetadataRoute.Robots {
  const base = CANONICAL_SITE_URL
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/api/',
          '/auth/',
          '/debug/',
          '/intro-letters',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
