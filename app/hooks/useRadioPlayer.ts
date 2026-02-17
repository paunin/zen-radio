import { useRef, useState, useCallback, useEffect } from "react";
import type { Station } from "~/types/station";
import { getItem, setItem, STORAGE_KEYS } from "~/lib/storage";
import { DEFAULT_VOLUME } from "~/lib/constants";
import {
  setMediaSessionMetadata,
  setMediaSessionPlaybackState,
} from "~/hooks/useMediaSession";

export interface RadioPlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  pendingPlay: boolean;
  volume: number;
  error: string | null;
}

export interface RadioPlayerActions {
  play: (station: Station) => void;
  load: (station: Station) => void;
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
  const [pendingPlay, setPendingPlay] = useState(false);
  const [volume, setVolumeState] = useState(() =>
    getItem<number>(STORAGE_KEYS.volume, DEFAULT_VOLUME)
  );
  const [error, setError] = useState<string | null>(null);

  const stationRef = useRef<Station | null>(null);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  stationRef.current = currentStation;
  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;

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
      // Belt-and-suspenders: also set imperatively on the audio event
      setMediaSessionPlaybackState("playing");
    };
    const onWaiting = () => setIsBuffering(true);
    const onStalled = () => setIsBuffering(true);
    const onError = () => {
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
        // Belt-and-suspenders: also set imperatively on the audio event
        setMediaSessionPlaybackState("paused");
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    setItem(STORAGE_KEYS.volume, volume);
  }, [volume]);

  const play = useCallback((station: Station) => {
    const audio = audioRef.current;
    if (!audio) return;
    setPendingPlay(false);

    if (stationRef.current?.id === station.id && !audio.paused) {
      audio.pause();
      audio.src = "";
      setCurrentStation(null);
      setIsPlaying(false);
      setIsPaused(false);
      setIsBuffering(false);
      setMediaSessionMetadata(null);
      setMediaSessionPlaybackState("none");
      return;
    }

    audio.pause();
    setError(null);
    setIsBuffering(true);
    setIsPlaying(false);
    setIsPaused(false);

    setCurrentStation(station);
    stationRef.current = station;
    setItem(STORAGE_KEYS.lastStation, station);

    audio.src = station.streamUrl;
    audio.play().catch(() => {
      setIsBuffering(false);
      setError("streamUnavailable");
    });

    // Set metadata + playbackState SYNCHRONOUSLY — critical for Chrome macOS media keys
    setMediaSessionMetadata(station);
    setMediaSessionPlaybackState("playing");
  }, []);

  const load = useCallback((station: Station) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = "";
    setError(null);
    setIsPlaying(false);
    setIsBuffering(false);
    setPendingPlay(true);

    setCurrentStation(station);
    stationRef.current = station;
    setIsPaused(true);
    isPausedRef.current = true;
    setItem(STORAGE_KEYS.lastStation, station);

    audio.src = station.streamUrl;

    setMediaSessionMetadata(station);
    setMediaSessionPlaybackState("paused");
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Set immediately — don't wait for React effect
      setMediaSessionPlaybackState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    setPendingPlay(false);
    setIsPaused(false);
    setIsBuffering(true);
    audio.play().catch(() => {
      setIsBuffering(false);
      setError("streamUnavailable");
    });
    // Set immediately — don't wait for React effect
    setMediaSessionPlaybackState("playing");
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPendingPlay(false);
    audio.pause();
    audio.src = "";
    setCurrentStation(null);
    stationRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setIsBuffering(false);
    setError(null);
    // Keep "paused" so Chrome macOS retains media session for re-play via key
    setMediaSessionPlaybackState("paused");
  }, []);

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
      pendingPlay,
      volume,
      error,
    },
    actions: {
      play,
      load,
      pause,
      resume,
      stop,
      togglePlayPause,
      setVolume,
    },
    audioRef,
  };
}
