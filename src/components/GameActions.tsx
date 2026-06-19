"use client";

import { useUserGames } from '@/hooks/useUserGames';

interface GameActionsProps {
  game: {
    slug: string;
    title: string;
    thumbnail: string;
    category: string;
  };
  translations: {
    favorite: string;
    share: string;
    addedToFavorites?: string;
    removedFromFavorites?: string;
  };
}

export default function GameActions({ game, translations }: GameActionsProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useUserGames();
  
  const isFav = isLoaded ? isFavorite(game.slug) : false;

  const handleFavoriteClick = () => {
    toggleFavorite({
      id: game.slug,
      title: game.title,
      thumbnail: game.thumbnail,
      category: game.category
    });
  };

  const handleShareClick = async () => {
    try {
      await navigator.share({
        title: game.title,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Share failed or unsupported', err);
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button 
        onClick={handleFavoriteClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 ${
          isFav 
            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
            : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/20'
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>
          favorite
        </span>
        {translations.favorite}
      </button>
      
      <button 
        onClick={handleShareClick}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/20 rounded-xl font-bold transition-colors"
      >
        <span className="material-symbols-outlined">share</span>
        {translations.share}
      </button>
    </div>
  );
}
