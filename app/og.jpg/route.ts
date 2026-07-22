import React from 'react';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '68px',
          color: '#ffffff',
          background: 'radial-gradient(circle at 80% 10%, #123d4a 0%, #071225 42%, #050d1b 100%)',
          fontFamily: 'Arial, sans-serif',
        },
      },
      React.createElement('div', { style: { display: 'flex', fontSize: 30, fontWeight: 700 } },
        React.createElement('span', null, 'Of'),
        React.createElement('span', { style: { color: '#FF9312' } }, 'Root'),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', maxWidth: 980 } },
        React.createElement('div', { style: { color: '#FFC46B', fontSize: 24, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase' } }, 'AI Growth Systems'),
        React.createElement('div', { style: { marginTop: 24, fontSize: 68, lineHeight: 1.02, fontWeight: 800, letterSpacing: -2 } }, 'Turn visibility, automation, and company knowledge into growth.'),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 22, fontSize: 24, color: '#cbd5e1' } },
        React.createElement('span', null, 'Discover'),
        React.createElement('span', { style: { color: '#FF9312' } }, '→'),
        React.createElement('span', null, 'Convert'),
        React.createElement('span', { style: { color: '#FF9312' } }, '→'),
        React.createElement('span', null, 'Operate'),
      ),
    ),
    { width: 1200, height: 630 },
  );
}
