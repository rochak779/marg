import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marg',
    short_name: 'Marg',
    description: 'A personalised path to practical AI skills.',
    start_url: '/',
    display: 'standalone',
    background_color: '#4820a9',
    theme_color: '#4820a9',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
