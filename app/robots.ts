import type { MetadataRoute } from 'next'
import { CANONICAL_SITE_URL } from '@/app/config/site'
import { PRIVATE_ROBOT_PATHS, ROBOT_USER_AGENT_GROUPS } from '@/app/lib/agent-robots'

export default function robots(): MetadataRoute.Robots {
  const base = CANONICAL_SITE_URL
  return {
    rules: ROBOT_USER_AGENT_GROUPS.map(userAgent => ({ userAgent, allow: '/', disallow: PRIVATE_ROBOT_PATHS })),
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
