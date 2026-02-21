import {
  createContext,
  useContext,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Station } from "~/types/station";
import { useRadioPlayer } from "~/hooks/useRadioPlayer";
import { useMediaSession } from "~/hooks/useMediaSession";
import { useCrossTabSync } from "~/hooks/useCrossTabSync";
import { useFavicon } from "~/hooks/useFavicon";
import { useRecentStations } from "~/hooks/useRecentStations";
import { useFavorites } from "~/hooks/useFavorites";

interface RadioState {
  currentStation: Station | null;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  pendingPlay: boolean;
  volume: number;
  recentStations: Station[];
  favorites: Station[];
  error: string | null;
}

interface RadioActions {
  play: (station: Station) => void;
  load: (station: Station) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  setVolume: (v: number) => void;
  toggleFavorite: (station: Station) => void;
  reorderFavorites: (reordered: Station[]) => void;
  isFavorite: (stationId: string) => boolean;
  removeRecent: (stationId: string) => void;
  clearRecent: () => void;
}

interface RadioContextValue {
  state: RadioState;
  actions: RadioActions;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: ReactNode }) {
  const searchInputRef = useRef<HTMLInputElement>(null!);

  const player = useRadioPlayer();
  const { recentStations, addRecent, removeRecent, clearRecent } = useRecentStations();
  const { favorites, toggleFavorite, reorderFavorites, isFavorite } = useFavorites();

  // Wrap play and load to also track recent
  const play = useCallback(
    (station: Station) => {
      player.actions.play(station);
      addRecent(station);
    },
    [player.actions, addRecent]
  );

  const load = useCallback(
    (station: Station) => {
      player.actions.load(station);
      addRecent(station);
    },
    [player.actions, addRecent]
  );

  // Next/previous track: cycle through favorites in a circular loop.
  // Use a ref so the media session handler always sees the latest favorites list.
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const playNextFavorite = useCallback(() => {
    const favs = favoritesRef.current;
    if (favs.length === 0) return;
    const currentId = player.state.currentStation?.id;
    const idx = favs.findIndex((s) => s.id === currentId);
    const next = favs[(idx + 1) % favs.length];
    play(next);
  }, [play, player.state.currentStation]);

  const playPreviousFavorite = useCallback(() => {
    const favs = favoritesRef.current;
    if (favs.length === 0) return;
    const currentId = player.state.currentStation?.id;
    const idx = favs.findIndex((s) => s.id === currentId);
    const prev = favs[(idx - 1 + favs.length) % favs.length];
    play(prev);
  }, [play, player.state.currentStation]);

  useMediaSession({
    onTogglePlayPause: player.actions.togglePlayPause,
    onPause: player.actions.pause,
    onStop: player.actions.stop,
    onNextTrack: playNextFavorite,
    onPreviousTrack: playPreviousFavorite,
  });

  // Cross-tab sync — stop local playback when another tab starts
  useCrossTabSync({
    isPlaying: player.state.isPlaying,
    onRemotePlay: player.actions.stop,
  });

  // Dynamic favicon
  useFavicon(player.state.isPlaying && !player.state.isPaused);

  const state: RadioState = {
    currentStation: player.state.currentStation,
    isPlaying: player.state.isPlaying,
    isPaused: player.state.isPaused,
    isBuffering: player.state.isBuffering,
    pendingPlay: player.state.pendingPlay,
    volume: player.state.volume,
    error: player.state.error,
    recentStations,
    favorites,
  };

  const actions: RadioActions = {
    play,
    load,
    pause: player.actions.pause,
    resume: player.actions.resume,
    stop: player.actions.stop,
    togglePlayPause: player.actions.togglePlayPause,
    setVolume: player.actions.setVolume,
    toggleFavorite,
    reorderFavorites,
    isFavorite,
    removeRecent,
    clearRecent,
  };

  return (
    <RadioContext.Provider value={{ state, actions, searchInputRef }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) {
    throw new Error("useRadio must be used within RadioProvider");
  }
  return ctx;
}
