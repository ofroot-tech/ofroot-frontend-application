import { CANONICAL_SITE_URL } from '@/app/config/site';
import { CONTENT_SIGNAL } from '@/app/lib/agent-readiness';

export const PRIVATE_ROBOT_PATHS = ['/dashboard', '/api/', '/auth/', '/debug/', '/intro-letters'];
export const ROBOT_USER_AGENT_GROUPS = [['*'], ['OAI-SearchBot', 'ChatGPT-User']];

// Next's metadata serializer omits custom directives. Middleware serves this text
// using the same crawl policy as the default metadata route.
export function agentRobotsText() {
  const groups = ROBOT_USER_AGENT_GROUPS.map(agents => [
    ...agents.map(agent => `User-Agent: ${agent}`),
    `Content-Signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    ...PRIVATE_ROBOT_PATHS.map(path => `Disallow: ${path}`),
  ].join('\n'));
  return `${groups.join('\n\n')}\n\nHost: ${CANONICAL_SITE_URL}\nSitemap: ${CANONICAL_SITE_URL}/sitemap.xml\n`;
}
