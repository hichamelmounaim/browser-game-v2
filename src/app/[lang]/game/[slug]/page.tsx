import { getGameBySlug, getAllGames, getSiteSettings } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GamePlayer from '@/components/GamePlayer';
import GameTracker from '@/components/GameTracker';
import GameActions from '@/components/GameActions';
import { getTranslation, getLocalizedPath } from '@/lib/translations';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  params: Promise<{ slug: string; lang: string }>;
};

// Generate dynamic SEO metadata based on the game and language in the database
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  const game = getGameBySlug(resolvedParams.slug);
  const settings = getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamecis.com';

  if (!game) {
    return {
      title: `Game Not Found | ${settings.site_name}`,
    };
  }

  let title = game.title;
  let description = game.description;
  let keywords = game.seo_keywords;
  if (lang === 'fr') {
    title = game.title_fr || title;
    description = game.description_fr || description;
    keywords = game.seo_keywords_fr || keywords;
  } else if (lang === 'es') {
    title = game.title_es || title;
    description = game.description_es || description;
    keywords = game.seo_keywords_es || keywords;
  }

  return {
    title: `${title} | Play Free on ${settings.site_name}`,
    description: description || `Play ${title} for free online. No downloads required.`,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      images: [game.thumbnail],
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}${getLocalizedPath(lang, 'game', resolvedParams.slug)}`,
      languages: {
        en: `${baseUrl}${getLocalizedPath('en', 'game', resolvedParams.slug)}`,
        fr: `${baseUrl}${getLocalizedPath('fr', 'game', resolvedParams.slug)}`,
        es: `${baseUrl}${getLocalizedPath('es', 'game', resolvedParams.slug)}`,
        'x-default': `${baseUrl}${getLocalizedPath('en', 'game', resolvedParams.slug)}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const games = getAllGames();
  const locales = ['en', 'fr', 'es'];
  const params: { slug: string; lang: string }[] = [];
  
  for (const locale of locales) {
    for (const game of games) {
      params.push({ slug: game.slug, lang: locale });
    }
  }
  return params;
}

export default async function GamePage({ params }: Props) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  const game: any = getGameBySlug(resolvedParams.slug);
  const siteSettings = getSiteSettings();
  const t = getTranslation(lang);

  if (!game) {
    notFound();
  }

  // Get slugified category link
  const getCategorySlug = (catName: string) => {
    return catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getDeterministicRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
    }
    // Simple LCG
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296; // 2^32
    hash = (a * hash + c) % m;
    if (hash < 0) hash += m;
    return hash / m;
  };
  
  const randomBase = getDeterministicRandom(game.slug);
  const generatedRating = parseFloat((4.0 + (randomBase * 0.9)).toFixed(1)); 
  const generatedCount = Math.floor(50 + getDeterministicRandom(game.slug + "_count") * 2500);
  
  const ratingValue = (game.rating && game.rating !== 4.5) ? parseFloat(game.rating.toFixed(1)) : generatedRating;
  const ratingCount = (game.rating && game.rating !== 4.5) ? Math.max(15, Math.round(game.rating * 35)) : generatedCount;

  let description = game.description;
  let short_description = game.short_description;
  let controls = game.controls;
  let editorial_review = game.editorial_review;
  let how_to_play = game.how_to_play;
  let tips = game.tips;

  if (lang === 'fr') {
    description = game.description_fr || description;
    short_description = game.short_description_fr || short_description;
    controls = game.controls_fr || controls;
    editorial_review = game.editorial_review_fr || editorial_review;
    how_to_play = game.how_to_play_fr || how_to_play;
    tips = game.tips_fr || tips;
  } else if (lang === 'es') {
    description = game.description_es || description;
    short_description = game.short_description_es || short_description;
    controls = game.controls_es || controls;
    editorial_review = game.editorial_review_es || editorial_review;
    how_to_play = game.how_to_play_es || how_to_play;
    tips = game.tips_es || tips;
  }

  const displayTitle = lang === 'fr' ? game.title_fr || game.title : lang === 'es' ? game.title_es || game.title : game.title;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamecis.com';

  const allGames = getAllGames();
  const recommendedGames = allGames.filter((g: any) => g.id !== game.id).sort(() => Math.random() - 0.5).slice(0, 48);
  const sidebarGames = allGames.filter((g: any) => g.id !== game.id).sort(() => Math.random() - 0.5).slice(0, 10);
  const developerGames = allGames.filter((g: any) => g.developer === game.developer && g.id !== game.id).slice(0, 4);
  // Fill empty developer games if none found
  if (developerGames.length < 4) {
    const extraGames = allGames.filter((g: any) => g.id !== game.id && !developerGames.find((d: any) => d.id === g.id)).slice(0, 4 - developerGames.length);
    developerGames.push(...extraGames);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": displayTitle,
            "description": description || `Play ${displayTitle} online for free on ${siteSettings.site_name}.`,
            "image": game.thumbnail,
            "url": `${baseUrl}${getLocalizedPath(lang, 'game', game.slug)}`,
            "genre": game.category,
            "applicationCategory": "Game",
            "operatingSystem": "Web Browser",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": ratingValue,
              "bestRating": "5",
              "worstRating": "1",
              "ratingCount": ratingCount
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${baseUrl}${getLocalizedPath(lang, 'home')}`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": game.category || 'Uncategorized',
                "item": `${baseUrl}${getLocalizedPath(lang, 'category', getCategorySlug(game.category || 'Uncategorized'))}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": displayTitle,
                "item": `${baseUrl}${getLocalizedPath(lang, 'game', game.slug)}`
              }
            ]
          })
        }}
      />
      <Navbar siteSettings={siteSettings} lang={lang} />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <GameTracker game={{ slug: game.slug, title: displayTitle, thumbnail: game.thumbnail, category: game.category }} />
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link href={`/${lang}`} className="text-primary font-bold text-xs hover:underline flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-xs">chevron_left</span> {t.backToCatalog}
          </Link>
        </div>

        {/* Responsive layout: Main content on left, sidebar on right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          
          {/* Main Area */}
          <div className="lg:col-span-3 flex flex-col gap-4 w-full overflow-hidden">
            
            {/* Game Screen Player */}
            <GamePlayer 
              iframeUrl={game.iframe_url} 
              title={displayTitle} 
              thumbnail={game.thumbnail} 
            />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-surface-white border border-outline-variant/10 rounded-2xl p-4 shadow-sm w-full">
              <div className="flex items-center gap-4">
                 <Image src={game.thumbnail} alt={displayTitle} width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover" />
                 <div>
                   <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-on-surface leading-none">
                     {displayTitle}
                   </h1>
                   <div className="text-xs text-on-surface-variant mt-1">by {game.developer || "Z & K Games"}</div>
                 </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-sm font-bold text-on-surface-variant">
                  <div className="flex flex-col items-center hover:text-primary cursor-pointer"><span className="material-symbols-outlined text-xl sm:text-2xl">thumb_up</span> {Math.floor(ratingCount * 0.92)}</div>
                  <div className="flex flex-col items-center hover:text-red-500 cursor-pointer"><span className="material-symbols-outlined text-xl sm:text-2xl">thumb_down</span> {ratingCount - Math.floor(ratingCount * 0.92)}</div>
                  <div className="flex flex-col items-center hover:text-blue-500 cursor-pointer"><span className="material-symbols-outlined text-xl sm:text-2xl">flag</span></div>
              </div>
            </div>

            {/* Grid of recommended games below the player */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-2">
               {recommendedGames.map((g: any) => (
                 <Link href={getLocalizedPath(lang, 'game', g.slug)} key={g.id} className="relative aspect-square rounded-xl overflow-hidden group border border-outline-variant/10 bg-surface-container-low">
                   <Image src={g.thumbnail} alt={g.title} fill sizes="(max-width: 640px) 25vw, 12vw" className="object-cover group-hover:scale-110 transition-transform" />
                 </Link>
               ))}
            </div>

            {/* Game Info Panel */}
            <div className="mt-8 flex flex-col gap-6 w-full lg:max-w-4xl mx-auto">
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Image src={game.thumbnail} alt={displayTitle} width={160} height={160} className="w-full md:w-40 md:h-40 rounded-2xl object-cover shadow-sm hidden md:block" />
                <div className="flex-1">
                   <div className="text-[10px] sm:text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                     <Link href={getLocalizedPath(lang, 'home')} className="hover:underline">GAMES</Link> <span className="text-on-surface-variant/50 mx-1">&gt;</span> <Link href={getLocalizedPath(lang, 'category', getCategorySlug(game.category || 'Uncategorized'))} className="hover:underline">{game.category || 'UNCATEGORIZED'}</Link>
                   </div>
                   <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight">{displayTitle}</h2>
                   <div className="text-sm font-bold text-on-surface-variant mt-1">by {game.developer || "Z & K Games"}</div>
                   
                   <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                     {short_description || "A fun and engaging game to play online directly in your browser. No downloads required."}
                   </p>
                   <GameActions game={{ slug: game.slug, title: displayTitle, thumbnail: game.thumbnail, category: game.category }} translations={{ favorite: t.favorite, share: t.share, addedToFavorites: t.addedToFavorites, removedFromFavorites: t.removedFromFavorites }} />
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-on-surface-variant font-medium leading-relaxed mt-2">
                {description && description.includes('<') ? (
                   <div dangerouslySetInnerHTML={{ __html: description }} className="space-y-4" />
                ) : (
                   <p className="whitespace-pre-line">{description || 'No description available for this game.'}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-6 border-t border-outline-variant/20 pt-8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500"><span className="material-symbols-outlined">star</span></div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rating</div>
                    <div className="text-base sm:text-lg font-extrabold text-on-surface">{ratingValue.toFixed(1)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500"><span className="material-symbols-outlined">local_fire_department</span></div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trending</div>
                    <div className="text-base sm:text-lg font-extrabold text-on-surface">#20</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined">update</span></div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Updated</div>
                    <div className="text-base sm:text-lg font-extrabold text-on-surface">{game.release_date || "Jun 2024"}</div>
                  </div>
                </div>
              </div>

              {editorial_review && (
                <div className="mt-8 bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <h3 className="text-xl font-bold text-primary mb-3">Editorial Review</h3>
                  <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: editorial_review }} />
                </div>
              )}

              {how_to_play && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sports_esports</span> How to Play
                  </h3>
                  <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed bg-surface-container-low rounded-xl p-5 border border-outline-variant/10" dangerouslySetInnerHTML={{ __html: how_to_play }} />
                </div>
              )}

              {tips && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">lightbulb</span> Tips & Tricks
                  </h3>
                  <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed bg-amber-50/50 rounded-xl p-5 border border-amber-500/20" dangerouslySetInnerHTML={{ __html: tips }} />
                </div>
              )}

              <h3 className="text-xl font-bold text-on-surface mt-6 border-b border-outline-variant/20 pb-4">About this game</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0 gap-x-12 text-sm mt-2">
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">sports_esports</span> Controls</span>
                  <span className="text-on-surface-variant text-right max-w-[50%]">{controls || "Mouse or keyboard"}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">devices</span> Supported devices</span>
                  <span className="text-on-surface-variant text-right">{game.supported_devices || "Desktop, phone and tablet"}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">code</span> Developer</span>
                  <span className="text-on-surface-variant text-right">{game.developer || "Z & K Games"}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">category</span> Genre</span>
                  <span className="text-on-surface-variant text-right">{game.category || "Uncategorized"}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">event</span> Release Date</span>
                  <span className="text-on-surface-variant text-right">{game.release_date || "March 2020"}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">update</span> Latest Update</span>
                  <span className="text-on-surface-variant text-right">{game.release_date || "Jun 2024"}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">star</span> Rating</span>
                  <span className="text-on-surface-variant text-right">{ratingValue.toFixed(1)} ({ratingCount} reviews)</span>
                </div>
                <div className="flex justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-lg opacity-70">policy</span> Privacy Policy</span>
                  <a href={game.privacy_policy || "#"} className="text-primary hover:underline text-right truncate max-w-[200px]">Privacy Policy</a>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t.relatedCategories || "Related categories"}</h3>
                  <Link href={getLocalizedPath(lang, 'categories')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">SHOW MORE <span className="material-symbols-outlined text-sm">add</span></Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={getLocalizedPath(lang, 'category', 'action')} className="text-xs font-bold px-4 py-2.5 bg-surface-container rounded-full hover:bg-primary-container text-on-surface hover:text-primary transition-colors uppercase tracking-wide">ACTION GAMES</Link>
                  <Link href={getLocalizedPath(lang, 'category', 'funny')} className="text-xs font-bold px-4 py-2.5 bg-surface-container rounded-full hover:bg-primary-container text-on-surface hover:text-primary transition-colors uppercase tracking-wide">FUNNY GAMES</Link>
                  <Link href={getLocalizedPath(lang, 'category', '3d')} className="text-xs font-bold px-4 py-2.5 bg-surface-container rounded-full hover:bg-primary-container text-on-surface hover:text-primary transition-colors uppercase tracking-wide">3D GAMES</Link>
                  <Link href={getLocalizedPath(lang, 'categories')} className="text-xs font-bold px-4 py-2.5 text-primary hover:underline transition-colors flex items-center gap-1 uppercase tracking-wide">{t.allGenres || "ALL GAMES"} <span className="material-symbols-outlined text-sm">open_in_new</span></Link>
                </div>
              </div>

              <div className="mt-10 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-on-surface">More games by this developer</h3>
                  <Link href={getLocalizedPath(lang, 'categories')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">SHOW MORE <span className="material-symbols-outlined text-sm">add</span></Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {developerGames.map((g: any) => (
                    <Link href={getLocalizedPath(lang, 'game', g.slug)} key={g.id} className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden group shadow-sm border border-outline-variant/10">
                      <Image src={g.thumbnail} alt={g.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Area */}
          <aside className="lg:col-span-1 flex flex-col gap-2 w-full pt-1 lg:pt-0">
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
              {sidebarGames.map((g: any) => (
                <Link href={getLocalizedPath(lang, 'game', g.slug)} key={g.id} className="relative aspect-square rounded-xl overflow-hidden group border border-outline-variant/10 bg-surface-container-low">
                  <Image src={g.thumbnail} alt={g.title} fill sizes="(max-width: 1024px) 25vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                </Link>
              ))}
            </div>
          </aside>
          
        </div>

        {/* FAQ JSON-LD Schema for Game Page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `How do I play ${displayTitle}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `To play ${displayTitle}, use your ${controls || "Mouse or keyboard"}. The game runs directly in your browser without any downloads required.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `Is ${displayTitle} free to play?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Yes! ${displayTitle} is completely free to play online on ${siteSettings.site_name}.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `Who developed ${displayTitle}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${displayTitle} was developed by ${game.developer || "Z & K Games"}.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `Can I play ${displayTitle} on my phone?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Yes, ${displayTitle} is supported on ${game.supported_devices || "Desktop, phone and tablet"}. You can play it seamlessly in your mobile browser.`
                  }
                }
              ]
            })
          }}
        />
      </main>

      <Footer siteSettings={siteSettings} lang={lang} />
    </>
  );
}
