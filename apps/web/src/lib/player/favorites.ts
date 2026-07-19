"use client";

import { useCallback, useState } from "react";

const STORAGE_PREFIX = "freeepg:favorites:";

function readFavorites(playlistCode: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${playlistCode}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeFavorites(playlistCode: string, favorites: Set<string>) {
  localStorage.setItem(
    `${STORAGE_PREFIX}${playlistCode}`,
    JSON.stringify([...favorites])
  );
}

export function usePlaylistFavorites(playlistCode: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    readFavorites(playlistCode)
  );

  const toggleFavorite = useCallback(
    (entryId: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(entryId)) {
          next.delete(entryId);
        } else {
          next.add(entryId);
        }
        writeFavorites(playlistCode, next);
        return next;
      });
    },
    [playlistCode]
  );

  const isFavorite = useCallback(
    (entryId: string) => favorites.has(entryId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
