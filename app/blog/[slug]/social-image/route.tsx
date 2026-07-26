import { ImageResponse } from 'next/og';
import { SITE } from '@/app/config/site';
import { getPublicBlogPost } from '../../post-utils';

export const runtime = 'nodejs';

const size = { width: 1200, height: 630 };

const palettes = [
  { background: '#071225', surface: '#102a4e', accent: '#FFC46B', muted: '#D9E2F0' },
  { background: '#10221F', surface: '#16423B', accent: '#9EE6C1', muted: '#D7F3E5' },
  { background: '#24142D', surface: '#46235A', accent: '#E9B7FF', muted: '#F1DDFB' },
  { background: '#2B1A0C', surface: '#69421B', accent: '#FFD392', muted: '#FBE7C5' },
];

function getTenantId(request: Request) {
  const tenantId = new URL(request.url).searchParams.get('tenant_id');
  return tenantId && /^\d+$/.test(tenantId) ? Number(tenantId) : undefined;
}

function paletteFor(slug: string) {
  return palettes[[...slug].reduce((total, character) => total + character.charCodeAt(0), 0) % palettes.length];
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await getPublicBlogPost(slug, getTenantId(request));
  const palette = paletteFor(slug);
  const title = truncate(post?.title || 'OfRoot Journal', 112);
  const description = post?.excerpt ? truncate(post.excerpt, 180) : 'Practical systems thinking for teams building with AI.';
  const topics = post?.tags?.slice(0, 3).join('  •  ') || 'AI systems  •  Operations  •  Growth';

  return new ImageResponse(
    (
      <div style={{ background: palette.background, color: '#FFFFFF', display: 'flex', fontFamily: 'sans-serif', height: '100%', overflow: 'hidden', padding: '58px 64px', position: 'relative', width: '100%' }}>
        <div style={{ background: palette.surface, borderRadius: 999, height: 560, opacity: 0.8, position: 'absolute', right: -124, top: -202, width: 560 }} />
        <div style={{ background: palette.accent, borderRadius: 999, height: 220, opacity: 0.86, position: 'absolute', right: 100, top: 120, width: 220 }} />
        <div style={{ background: palette.surface, borderRadius: 999, bottom: -164, height: 360, left: -122, opacity: 0.95, position: 'absolute', width: 360 }} />
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', maxWidth: 900, position: 'relative', width: '100%' }}>
          <div style={{ alignItems: 'center', color: palette.accent, display: 'flex', fontSize: 21, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>{SITE.name} / Journal</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
            <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.03, maxWidth: 880 }}>{title}</div>
            <div style={{ color: palette.muted, display: 'flex', fontSize: 25, lineHeight: 1.35, marginTop: 28, maxWidth: 810 }}>{description}</div>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', fontSize: 20, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            <span style={{ background: palette.accent, display: 'flex', height: 10, marginRight: 16, width: 68 }} />{topics}
          </div>
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
