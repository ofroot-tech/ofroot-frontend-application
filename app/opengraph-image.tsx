import { ImageResponse } from 'next/og';

export const alt = 'OFROOT — Less manual work. More time to grow.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '62px 70px', background: '#17141f', color: '#faf9fc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', width: 64, height: 64, alignItems: 'center', justifyContent: 'center', background: '#050505', border: '1px solid #625c68', fontSize: 25, fontWeight: 800 }}>OFT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}><span style={{ fontSize: 32, fontWeight: 700, letterSpacing: 1 }}>OFROOT</span><span style={{ fontSize: 10, letterSpacing: 3, color: '#bcb2c9' }}>TECHNOLOGY</span></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 78, fontWeight: 700, letterSpacing: -4, lineHeight: 1.08 }}><span>Less manual work.</span><span>More time to grow.</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#c2a9e5', fontSize: 20 }}><span>Software, automation &amp; practical AI</span><span style={{ marginLeft: 'auto', color: '#ffb78f' }}>ofroot.technology</span></div>
    </div>, size,
  );
}
