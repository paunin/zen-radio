import { useRef, useState, useCallback, useEffect } from "react";
import type { Station } from "~/types/station";
import { getItem, setItem, STORAGE_KEYS } from "~/lib/storage";
import { DEFAULT_VOLUME } from "~/lib/constants";

export interface RadioPlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  volume: number;
  error: string | null;
}

export interface RadioPlayerActions {
  play: (station: Station) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  setVolume: (v: number) => void;
}

export function useRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState(() =>
    getItem<number>(STORAGE_KEYS.volume, DEFAULT_VOLUME)
  );
  const [error, setError] = useState<string | null>(null);

  // Stable refs for callbacks to read current state without re-creating functions
  const stationRef = useRef<Station | null>(null);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  stationRef.current = currentStation;
  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;

  // Initialize audio element once — no crossOrigin to avoid CORS issues with radio streams
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
    };
    const onWaiting = () => setIsBuffering(true);
    const onStalled = () => setIsBuffering(true);
    const onError = () => {
      // Only report errors when we actually tried to load a stream
      if (audio.src && stationRef.current) {
        setError("streamUnavailable");
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };
    const onPause = () => {
      if (audio.src && stationRef.current) {
        setIsPaused(true);
        setIsPlaying(false);
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    setItem(STORAGE_KEYS.volume, volume);
  }, [volume]);

  const play = useCallback((station: Station) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Toggle off if same station is already playing
    if (stationRef.current?.id === station.id && !audio.paused) {
      audio.pause();
      audio.src = "";
      setCurrentStation(null);
      setIsPlaying(false);
      setIsPaused(false);
      setIsBuffering(false);
      return;
    }

    // Stop current before starting new
    audio.pause();
    setError(null);
    setIsBuffering(true);
    setIsPlaying(false);
    setIsPaused(false);

    setCurrentStation(station);
    stationRef.current = station;
    setItem(STORAGE_KEYS.lastStation, station);

    audio.src = station.streamUrl;
    audio.load();
    audio.play().catch(() => {
      setIsBuffering(false);
      setError("streamUnavailable");
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    setIsPaused(false);
    setIsBuffering(true);
    audio.play().catch(() => {
      setIsBuffering(false);
      setError("streamUnavailable");
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setCurrentStation(null);
    stationRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setIsBuffering(false);
    setError(null);
  }, []);

  // togglePlayPause reads refs so the function identity is stable (never changes)
  const togglePlayPause = useCallback(() => {
    if (isPausedRef.current) {
      resume();
    } else if (isPlayingRef.current) {
      pause();
    } else {
      const lastStation = getItem<Station | null>(STORAGE_KEYS.lastStation, null);
      if (lastStation) {
        play(lastStation);
      }
    }
  }, [resume, pause, play]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(100, v)));
  }, []);

  return {
    state: {
      currentStation,
      isPlaying,
      isPaused,
      isBuffering,
      volume,
      error,
    },
    actions: {
      play,
      pause,
      resume,
      stop,
      togglePlayPause,
      setVolume,
    },
    audioRef,
  };
}
