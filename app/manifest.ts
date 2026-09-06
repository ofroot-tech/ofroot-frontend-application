import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OfRoot Technology',
    short_name: 'OfRoot',
    description: 'AI growth systems for visibility, conversion, and operations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#071225',
    theme_color: '#071225',
    icons: [{ src: '/ofroot-root-mark.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
