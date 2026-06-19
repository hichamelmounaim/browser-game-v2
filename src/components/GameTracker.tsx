"use client";

import { useEffect, useRef } from 'react';
import { useUserGames } from '@/hooks/useUserGames';

interface GameTrackerProps {
  game: {
    slug: string;
    title: string;
    thumbnail: string;
    category: string;
  };
}

export default function GameTracker({ game }: GameTrackerProps) {
  const { addRecentlyPlayed } = useUserGames();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      addRecentlyPlayed({
        id: game.slug,
        title: game.title,
        thumbnail: game.thumbnail,
        category: game.category || 'Uncategorized'
      });
      tracked.current = true;
    }
  }, [game, addRecentlyPlayed]);

  return null; // This component doesn't render anything
}
