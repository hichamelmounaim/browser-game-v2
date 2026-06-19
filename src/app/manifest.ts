import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/db';

export default function manifest(): MetadataRoute.Manifest {
  const settings = getSiteSettings();
  
  return {
    name: settings.site_name,
    short_name: settings.site_name,
    description: `Play free online games on ${settings.site_name}`,
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0d9488',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
