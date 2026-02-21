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

  const [currentStation, setCurrentStation] = useState<Station | null>(() =>
    getItem<Station | null>(STORAGE_KEYS.lastStation, null)
  );
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
  const streamUrlRef = useRef<string>("");
  const reconnectingRef = useRef(false);
  stationRef.current = currentStation;
  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const onPlaying = () => {
      reconnectingRef.current = false;
      setIsBuffering(false);
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
      setMediaSessionPlaybackState("playing");
    };
    const onWaiting = () => {
      if (!reconnectingRef.current) setIsBuffering(true);
    };
    const onError = () => {
      if (reconnectingRef.current) return;
      // Connection drops while paused are normal for live streams — ignore
      if (isPausedRef.current) return;
      if (audio.src && stationRef.current) {
        setError("streamUnavailable");
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };
    const onPause = () => {
      if (reconnectingRef.current) return;
      if (audio.src && stationRef.current) {
        setIsPaused(true);
        setIsPlaying(false);
        setMediaSessionPlaybackState("paused");
      }
    };

    const reconnectStream = () => {
      const url = streamUrlRef.current;
      if (!url || reconnectingRef.current) return;
      reconnectingRef.current = true;
      setIsBuffering(true);
      setMediaSessionPlaybackState("playing");
      const separator = url.includes("?") ? "&" : "?";
      audio.src = `${url}${separator}_t=${Date.now()}`;
      audio.play().catch(() => {
        reconnectingRef.current = false;
        setIsBuffering(false);
        setIsPaused(true);
        setIsPlaying(false);
        setMediaSessionPlaybackState("paused");
      });
    };

    const onStalled = () => {
      if (reconnectingRef.current) return;
      if (!isPlayingRef.current) return;
      if (audio.paused) {
        reconnectStream();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) return;
      if (!isPlayingRef.current) return;
      if (reconnectingRef.current) return;

      if (audio.paused) {
        reconnectStream();
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("stalled", onStalled);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("stalled", onStalled);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Restore last station on mount (loaded but not playing)
  useEffect(() => {
    const saved = getItem<Station | null>(STORAGE_KEYS.lastStation, null);
    if (saved) {
      stationRef.current = saved;
      streamUrlRef.current = saved.streamUrl;
      isPausedRef.current = true;
      setIsPaused(true);
      setMediaSessionMetadata(saved);
      setMediaSessionPlaybackState("paused");
    }
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
      streamUrlRef.current = "";
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
    streamUrlRef.current = station.streamUrl;
    setItem(STORAGE_KEYS.lastStation, station);

    audio.src = station.streamUrl;
    audio.play().catch(() => {
      setIsBuffering(false);
      setError("streamUnavailable");
    });

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
    streamUrlRef.current = station.streamUrl;
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
      setMediaSessionPlaybackState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    const url = streamUrlRef.current;
    if (!audio || !url) return;

    setPendingPlay(false);
    setIsPaused(false);
    setIsBuffering(true);
    setError(null);

    // Live radio streams lose their connection on pause (especially on iOS
    // lock screen / PWA standalone). Suppress spurious events during the
    // src reset, then open a completely fresh connection.
    // A cache-busting param ensures iOS doesn't reuse a dead connection.
    reconnectingRef.current = true;
    const separator = url.includes("?") ? "&" : "?";
    audio.src = `${url}${separator}_t=${Date.now()}`;
    audio.play().catch(() => {
      reconnectingRef.current = false;
      setIsBuffering(false);
      setError("streamUnavailable");
    });

    setMediaSessionPlaybackState("playing");
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPendingPlay(false);
    audio.pause();
    audio.src = "";
    streamUrlRef.current = "";
    setCurrentStation(null);
    stationRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setIsBuffering(false);
    setError(null);
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
