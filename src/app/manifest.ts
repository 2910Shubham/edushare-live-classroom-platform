import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduShare',
    short_name: 'EduShare',
    description: 'The classroom of the future. Real-time smart boards, AI-powered notes, and live collaboration.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6c63ff',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
