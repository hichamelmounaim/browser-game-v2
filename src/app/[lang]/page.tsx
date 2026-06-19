import Navbar from '@/components/Navbar';
import HomeClient from '@/components/HomeClient';
import Footer from '@/components/Footer';
import { getAllGames, getAllCategories, getSiteSettings } from '@/lib/db';
import { getTranslation } from '@/lib/translations';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  const settings = getSiteSettings();
  const t = getTranslation(lang);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamecis.com';

  return {
    title: t.seoTitle.replace('Gamecis.com', settings.site_name),
    description: t.seoDescription.replace('Gamecis.com', settings.site_name),
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: {
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
        es: `${baseUrl}/es`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: t.seoTitle.replace('Gamecis.com', settings.site_name),
      description: t.seoDescription.replace('Gamecis.com', settings.site_name),
      url: `${baseUrl}/${lang}`,
      siteName: settings.site_name,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: settings.site_name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.seoTitle.replace('Gamecis.com', settings.site_name),
      description: t.seoDescription.replace('Gamecis.com', settings.site_name),
      images: ['/og-image.jpg'],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  const games = getAllGames();
  const categories = getAllCategories();
  const siteSettings = getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamecis.com';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": siteSettings.site_name,
              "url": `${baseUrl}/${lang}`,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${baseUrl}/${lang}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": siteSettings.site_name,
              "url": baseUrl,
              "logo": `${baseUrl}/favicon.png`,
              "sameAs": []
            }
          ])
        }}
      />
      <Navbar siteSettings={siteSettings} lang={lang} />
      <HomeClient games={games} categories={categories} siteSettings={siteSettings} lang={lang} />
      <Footer siteSettings={siteSettings} lang={lang} />
    </>
  );
}
