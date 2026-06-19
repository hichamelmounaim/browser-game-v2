"use client";

import { useUserGames } from '@/hooks/useUserGames';
import GameCard from '@/components/GameCard';

interface MyGamesClientProps {
  lang: string;
  translations: {
    myGames: string;
    favorites: string;
    recentlyPlayed: string;
    noFavorites: string;
    noRecentlyPlayed: string;
  };
}

export default function MyGamesClient({ lang, translations }: MyGamesClientProps) {
  const { favorites, recentlyPlayed, isLoaded } = useUserGames();

  if (!isLoaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="mb-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2">
          {translations.myGames}
        </h1>
        <p className="text-on-surface-variant font-medium">
          Your saved favorites and recently played games, stored locally.
        </p>
      </header>

      {/* Favorites Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-red-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <h2 className="text-2xl font-bold text-on-surface">{translations.favorites}</h2>
        </div>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {favorites.map(game => (
              <GameCard 
                key={game.id}
                id={game.id}
                title={game.title}
                thumbnail={game.thumbnail}
                category={game.category}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">heart_broken</span>
            <p className="text-on-surface-variant font-medium">{translations.noFavorites}</p>
          </div>
        )}
      </section>

      {/* Recently Played Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-blue-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <h2 className="text-2xl font-bold text-on-surface">{translations.recentlyPlayed}</h2>
        </div>
        
        {recentlyPlayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {recentlyPlayed.map(game => (
              <GameCard 
                key={`recent-${game.id}`}
                id={game.id}
                title={game.title}
                thumbnail={game.thumbnail}
                category={game.category}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">sports_esports</span>
            <p className="text-on-surface-variant font-medium">{translations.noRecentlyPlayed}</p>
          </div>
        )}
      </section>
    </div>
  );
}
