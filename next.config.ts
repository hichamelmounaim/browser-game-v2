import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      // French (fr)
      {
        source: '/fr/categorie/:slug',
        destination: '/fr/category/:slug',
      },
      {
        source: '/fr/jeu/:slug',
        destination: '/fr/game/:slug',
      },
      {
        source: '/fr/nouveaux',
        destination: '/fr/new',
      },
      {
        source: '/fr/tendances',
        destination: '/fr/trending',
      },
      // Spanish (es)
      {
        source: '/es/categoria/:slug',
        destination: '/es/category/:slug',
      },
      {
        source: '/es/juego/:slug',
        destination: '/es/game/:slug',
      },
      {
        source: '/es/categorias',
        destination: '/es/categories',
      },
      {
        source: '/es/nuevos',
        destination: '/es/new',
      },
      {
        source: '/es/tendencias',
        destination: '/es/trending',
      },
    ];
  },
};

export default nextConfig;
