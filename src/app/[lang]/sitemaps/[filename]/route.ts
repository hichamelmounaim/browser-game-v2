import { NextResponse } from 'next/server';
import { getAllGames, getAllCategories } from '@/lib/db';
import { getLocalizedPath } from '@/lib/translations';

const LOCALES = ['en', 'fr', 'es'] as const;
type Locale = typeof LOCALES[number];

const getAlternatesXml = (
  baseUrl: string,
  type: 'home' | 'category' | 'game' | 'new' | 'trending' | 'categories',
  slug?: string
) => {
  let lines = '';
  LOCALES.forEach(l => {
    const localizedPath = getLocalizedPath(l, type, slug);
    lines += `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}${localizedPath}" />\n`;
  });
  // x-default goes to English version
  const defaultPath = getLocalizedPath('en', type, slug);
  lines += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${defaultPath}" />\n`;
  return lines;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string; filename: string }> }
) {
  try {
    const { lang, filename } = await params;
    
    if (!LOCALES.includes(lang as any)) {
      return new NextResponse('<error>Invalid language</error>', { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamecis.com';
    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;

    if (filename === 'sitemap-categories.xml') {
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
      
      // 1. Home Page for this language
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${getLocalizedPath(lang, 'home')}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += getAlternatesXml(baseUrl, 'home');
      xml += `  </url>\n`;

      // 2. Static Pages for this language
      const staticTypes = ['categories', 'new', 'trending'] as const;
      staticTypes.forEach(type => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${getLocalizedPath(lang, type)}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${type === 'categories' ? 'weekly' : 'daily'}</changefreq>\n`;
        xml += `    <priority>${type === 'categories' ? '0.8' : '0.9'}</priority>\n`;
        xml += getAlternatesXml(baseUrl, type);
        xml += `  </url>\n`;
      });

      // 3. Categories for this language
      const categories = getAllCategories();
      categories.forEach(c => {
        if (!c.slug) return;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${getLocalizedPath(lang, 'category', c.slug)}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += getAlternatesXml(baseUrl, 'category', c.slug);
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      });
    }

    // Handle sitemap-games-[page].xml
    const match = filename.match(/^sitemap-games-(\d+)\.xml$/);
    if (!match) {
      return new NextResponse('<error>Sitemap file not found</error>', { status: 404 });
    }

    const pageNum = parseInt(match[1], 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return new NextResponse('<error>Invalid page number</error>', { status: 404 });
    }

    const games = getAllGames();
    const pageSize = 2000;
    const totalPages = Math.max(1, Math.ceil(games.length / pageSize));

    if (pageNum > totalPages) {
      return new NextResponse('<error>Page not found</error>', { status: 404 });
    }

    const startIdx = (pageNum - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const gamesChunk = games.slice(startIdx, endIdx);

    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    gamesChunk.forEach(game => {
      if (!game.slug) return;
      const gameDate = game.created_at ? new Date(game.created_at).toISOString() : currentDate;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${getLocalizedPath(lang, 'game', game.slug)}</loc>\n`;
      xml += `    <lastmod>${gameDate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += getAlternatesXml(baseUrl, 'game', game.slug);
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error: any) {
    return new NextResponse(`<error>${error.message}</error>`, { status: 500 });
  }
}
