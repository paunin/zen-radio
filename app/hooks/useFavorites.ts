import { useState, useCallback } from "react";
import type { Station } from "~/types/station";
import { getItem, setItem, STORAGE_KEYS } from "~/lib/storage";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Station[]>(() =>
    getItem<Station[]>(STORAGE_KEYS.favorites, [])
  );

  const toggleFavorite = useCallback((station: Station) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.id === station.id);
      const next = exists
        ? prev.filter((s) => s.id !== station.id)
        : [station, ...prev];
      setItem(STORAGE_KEYS.favorites, next);
      return next;
    });
  }, []);

  const reorderFavorites = useCallback((reordered: Station[]) => {
    setFavorites(reordered);
    setItem(STORAGE_KEYS.favorites, reordered);
  }, []);

  const isFavorite = useCallback(
    (stationId: string) => favorites.some((s) => s.id === stationId),
    [favorites]
  );

  return { favorites, toggleFavorite, reorderFavorites, isFavorite };
}
