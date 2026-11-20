import { z } from 'zod';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { getPublicMarkdown, isPublicMarkdownPath, publicMarkdownPaths } from '@/app/lib/agent-readiness';
import { AgentError, AGENT_TIMEOUT_MS, limitedText } from '@/app/lib/agent-http';
import { getSigningIdentity, signedPublicRequest, type SigningIdentity } from '@/app/lib/agent-signing';

export const AGENT_VERSION = '1.0.0';
export const MAX_PUBLIC_PAGE_BYTES = 96 * 1024;
export const searchInput = z.object({ query: z.string().trim().min(1).max(160), limit: z.number().int().min(1).max(5).default(5) }).strict();
export const readInput = z.object({ path: z.string().max(300).refine(isPublicMarkdownPath, 'Public page not found.') }).strict();

const index = publicMarkdownPaths().map(path => {
  const markdown = getPublicMarkdown(path)!;
  const paragraphs = markdown.split('\n\n');
  return { path, url: `${CANONICAL_SITE_URL}${path}`, title: paragraphs[0].replace(/^# /, ''), excerpt: paragraphs.slice(2).find(line => !line.startsWith('#'))?.slice(0, 240) || '', text: markdown.toLowerCase() };
});

export function searchPublicPages(input: unknown) {
  const parsed = searchInput.safeParse(input);
  if (!parsed.success) throw new AgentError('Use a search query of 1–160 characters and a limit from 1 to 5.');
  const { query, limit } = parsed.data;
  const terms = query.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.slice(0, 16) || [];
  if (!terms.length) throw new AgentError('Search must contain a word or number.');
  const results = index.map(page => ({ page, score: terms.reduce((score, term) => score + (page.title.toLowerCase().includes(term) ? 5 : page.text.includes(term) ? 1 : 0), 0) }))
    .filter(item => item.score > 0).sort((left, right) => right.score - left.score || left.page.path.localeCompare(right.page.path))
    .slice(0, limit).map(({ page: { path, url, title, excerpt } }) => ({ path, url, title, excerpt }));
  return { query, results };
}

export async function readPublicPage(input: unknown, options: { fetcher?: typeof fetch; identity?: SigningIdentity } = {}) {
  const parsed = readInput.safeParse(input);
  if (!parsed.success) throw new AgentError('Public page not found.', 404);
  const request = await signedPublicRequest(parsed.data.path, options.identity ?? await getSigningIdentity());
  try {
    const response = await (options.fetcher ?? fetch)(request, { signal: AbortSignal.timeout(AGENT_TIMEOUT_MS), cache: 'no-store' });
    if (response.status !== 200 || response.redirected || response.headers.get('content-type')?.split(';')[0].trim() !== 'text/markdown') {
      void response.body?.cancel().catch(() => {});
      throw new AgentError('The public source did not return Markdown.', 502);
    }
    if (Number(response.headers.get('content-length')) > MAX_PUBLIC_PAGE_BYTES) {
      void response.body?.cancel().catch(() => {});
      throw new AgentError('Public source exceeds the size limit.', 502);
    }
    const markdown = await limitedText(response.body, MAX_PUBLIC_PAGE_BYTES);
    return { path: parsed.data.path, url: request.url, markdown, retrieval: 'signed-public-get' as const };
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentError('The public source is temporarily unavailable.', 502);
  }
}

export async function executePublicTool(name: string, input: unknown) {
  if (name === 'search_public_pages') return searchPublicPages(input);
  if (name === 'read_public_page') return readPublicPage(input);
  throw new AgentError('Unknown public tool.', 404);
}
