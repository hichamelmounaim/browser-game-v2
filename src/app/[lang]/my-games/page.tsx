import { getSiteSettings } from '@/lib/db';
import { getTranslation } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MyGamesClient from '@/components/MyGamesClient';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  const t = getTranslation(lang);
  const settings = getSiteSettings();

  return {
    title: `${t.myGames || 'My Games'} | ${settings.site_name}`,
    description: `View your favorite and recently played games on ${settings.site_name}.`,
    robots: {
      index: false, // Don't index user-specific pages
      follow: false,
    }
  };
}

export default async function MyGamesPage({ params }: Props) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'en';
  const settings = getSiteSettings();
  const t = getTranslation(lang);

  return (
    <>
      <Navbar siteSettings={settings} lang={lang} />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-10 min-h-[70vh]">
        <MyGamesClient 
          lang={lang} 
          translations={{
            myGames: t.myGames || "My Games",
            favorites: t.favorites || "Favorites",
            recentlyPlayed: t.recentlyPlayed || "Recently Played",
            noFavorites: t.noFavorites || "You haven't saved any games yet.",
            noRecentlyPlayed: t.noRecentlyPlayed || "You haven't played any games recently."
          }} 
        />
      </main>
      <Footer siteSettings={settings} lang={lang} />
    </>
  );
}
