import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OfRoot Technology',
    short_name: 'OfRoot',
    description: 'Software, automation, and practical AI for growing businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#17141f',
    theme_color: '#17141f',
    icons: [{ src: '/ofroot-monogram.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
