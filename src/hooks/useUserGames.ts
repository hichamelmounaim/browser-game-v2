"use client";

import { useState, useEffect } from 'react';

export interface SavedGame {
  id: string; // usually the slug
  title: string;
  thumbnail: string;
  category: string;
}

export function useUserGames() {
  const [favorites, setFavorites] = useState<SavedGame[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SavedGame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('gamecis_favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      
      const storedRecent = localStorage.getItem('gamecis_recent');
      if (storedRecent) setRecentlyPlayed(JSON.parse(storedRecent));
    } catch (e) {
      console.error("Could not parse user games from local storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleFavorite = (game: SavedGame) => {
    setFavorites(prev => {
      const exists = prev.find(g => g.id === game.id);
      let newFavs;
      if (exists) {
        newFavs = prev.filter(g => g.id !== game.id);
      } else {
        newFavs = [game, ...prev];
      }
      localStorage.setItem('gamecis_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const addRecentlyPlayed = (game: SavedGame) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(g => g.id !== game.id);
      const newRecent = [game, ...filtered].slice(0, 24); // Keep top 24
      localStorage.setItem('gamecis_recent', JSON.stringify(newRecent));
      return newRecent;
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some(g => g.id === id);
  };

  return {
    favorites,
    recentlyPlayed,
    toggleFavorite,
    addRecentlyPlayed,
    isFavorite,
    isLoaded
  };
}
