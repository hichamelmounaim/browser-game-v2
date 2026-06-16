import Link from 'next/link';
import Image from 'next/image';
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getAllGames, getSiteSettings } from '@/lib/db';

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  const settings = getSiteSettings();
  const brandName = settings?.site_name || 'Gamecis';
  
  // Get some games to show
  const allGames = getAllGames();
  const trendingGames = allGames
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        />
      </head>
      <body className="bg-background text-on-surface font-body-md min-h-screen flex flex-col">
        
        <nav className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-black/5 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 max-w-[1440px] mx-auto w-full">
            <Link href="/" className="flex items-center gap-2 font-headline-md text-headline-md font-black tracking-tighter text-primary">
              {settings?.site_logo ? (
                <Image src={settings.site_logo} alt={brandName} width={120} height={48} className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <span>{brandName}</span>
              )}
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <h1 className="text-9xl font-black text-primary/20 select-none">404</h1>
          <h2 className="text-3xl font-extrabold text-on-surface mt-4 text-center">Oops! We couldn't find that page.</h2>
          <p className="text-on-surface-variant mt-2 mb-8 text-center max-w-md">
            The game or page you're looking for might have been moved or no longer exists.
          </p>
          <Link href="/en" className="px-8 py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md flex items-center gap-2">
            <span className="material-symbols-outlined">home</span> Back to Home
          </Link>

          <div className="mt-16 w-full max-w-[1440px]">
            <h3 className="text-xl font-bold text-on-surface mb-6 text-center">Try these Trending Games instead</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {trendingGames.map((g: any) => (
                <Link href={`/en/game/${g.slug}`} key={g.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-outline-variant/10">
                  <Image src={g.thumbnail} alt={g.title} fill sizes="(max-width: 640px) 50vw, 16vw" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-surface-container-highest w-full mt-12 border-t border-black/5 py-6">
          <div className="text-center text-xs text-on-surface-variant font-bold">
            © 2026 {brandName}. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
