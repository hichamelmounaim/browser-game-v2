import { NextResponse } from 'next/server';
import { getAllGames } from '@/lib/db';

export async function GET() {
  try {
    const games = getAllGames();
    const locales = ['en', 'fr', 'es'];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamecis.com';
    const currentDate = new Date().toISOString().split('T')[0];
    const pageSize = 2000;
    const gameSitemapsCount = Math.max(1, Math.ceil(games.length / pageSize));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    locales.forEach(lang => {
      // 1. Categories Sitemap
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/${lang}/sitemaps/sitemap-categories.xml</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `  </sitemap>\n`;

      // 2. Game Shards Sitemaps
      for (let i = 0; i < gameSitemapsCount; i++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${baseUrl}/${lang}/sitemaps/sitemap-games-${i + 1}.xml</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `  </sitemap>\n`;
      }
    });

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (err: any) {
    return new NextResponse(`<error>${err.message}</error>`, { status: 500 });
  }
}
