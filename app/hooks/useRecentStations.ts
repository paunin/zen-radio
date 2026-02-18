import { useState, useCallback } from "react";
import type { Station } from "~/types/station";
import { getItem, setItem, STORAGE_KEYS } from "~/lib/storage";
import { MAX_RECENT } from "~/lib/constants";

export function useRecentStations() {
  const [recentStations, setRecentStations] = useState<Station[]>(() =>
    getItem<Station[]>(STORAGE_KEYS.recent, [])
  );

  const addRecent = useCallback((station: Station) => {
    setRecentStations((prev) => {
      const filtered = prev.filter((s) => s.id !== station.id);
      const next = [station, ...filtered].slice(0, MAX_RECENT);
      setItem(STORAGE_KEYS.recent, next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((stationId: string) => {
    setRecentStations((prev) => {
      const next = prev.filter((s) => s.id !== stationId);
      setItem(STORAGE_KEYS.recent, next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentStations([]);
    setItem(STORAGE_KEYS.recent, []);
  }, []);

  return { recentStations, addRecent, removeRecent, clearRecent };
}
