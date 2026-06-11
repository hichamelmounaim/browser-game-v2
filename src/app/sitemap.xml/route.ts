import { NextResponse } from "next/server";
import { getAllGames, getAllCategories } from "@/lib/db";

export async function GET() {
  try {
    const games = getAllGames();
    const categories = getAllCategories();
    const locales = ["en", "fr", "es"];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gamecis.com";

    // Generate XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // Helper to generate alternates for languages
    const getAlternatesXml = (path: string) => {
      const parts = locales.map(lang => 
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}${path}" />`
      );
      parts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${path}" />`);
      return parts.join('\n');
    };

    // 1. Home pages
    for (const lang of locales) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/${lang}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `${getAlternatesXml("")}\n`;
      xml += `  </url>\n`;
    }

    // 2. Static pages
    const staticPaths = ["/categories", "/new", "/trending"];
    for (const lang of locales) {
      for (const path of staticPaths) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/${lang}${path}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>${path === "/categories" ? "weekly" : "daily"}</changefreq>\n`;
        xml += `    <priority>${path === "/categories" ? "0.8" : "0.9"}</priority>\n`;
        xml += `${getAlternatesXml(path)}\n`;
        xml += `  </url>\n`;
      }
    }

    // 3. Category pages
    for (const lang of locales) {
      for (const category of categories) {
        if (!category.slug) continue;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/${lang}/category/${category.slug}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `${getAlternatesXml(`/category/${category.slug}`)}\n`;
        xml += `  </url>\n`;
      }
    }

    // 4. Game pages
    for (const lang of locales) {
      for (const game of games) {
        if (!game.slug) continue;
        const dateStr = game.created_at ? new Date(game.created_at).toISOString() : new Date().toISOString();
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/${lang}/game/${game.slug}</loc>\n`;
        xml += `    <lastmod>${dateStr}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `${getAlternatesXml(`/game/${game.slug}`)}\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (err: any) {
    return new NextResponse(`<error>${err.message}</error>`, { status: 500 });
  }
}
