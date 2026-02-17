import { useEffect, useRef } from "react";
import type { Station } from "~/types/station";

interface UseMediaSessionOptions {
  station: Station | null;
  isPlaying: boolean;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onPause: () => void;
  onStop: () => void;
}

function getAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function trySetHandler(
  action: MediaSessionAction,
  handler: MediaSessionActionHandler | null
) {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Unsupported action on this browser — ignore
  }
}

export function useMediaSession({
  station,
  isPlaying,
  isPaused,
  onTogglePlayPause,
  onPause,
  onStop,
}: UseMediaSessionOptions) {
  // Keep callbacks in refs so the effect that registers handlers never re-runs
  const toggleRef = useRef(onTogglePlayPause);
  const pauseRef = useRef(onPause);
  const stopRef = useRef(onStop);
  toggleRef.current = onTogglePlayPause;
  pauseRef.current = onPause;
  stopRef.current = onStop;

  // Register action handlers once — stable via refs
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    trySetHandler("play", () => toggleRef.current());
    trySetHandler("pause", () => pauseRef.current());
    trySetHandler("stop", () => stopRef.current());

    // Disable seek controls (irrelevant for live radio)
    trySetHandler("seekbackward", null);
    trySetHandler("seekforward", null);
    trySetHandler("seekto", null);

    return () => {
      trySetHandler("play", null);
      trySetHandler("pause", null);
      trySetHandler("stop", null);
    };
  }, []);

  // Update metadata when station changes
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (station) {
      const artwork: MediaImage[] = [];

      if (station.favicon) {
        artwork.push({
          src: getAbsoluteUrl(station.favicon),
          sizes: "256x256",
          type: "image/png",
        });
      }

      artwork.push(
        {
          src: getAbsoluteUrl("/images/icon-192.png"),
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: getAbsoluteUrl("/images/icon-512.png"),
          sizes: "512x512",
          type: "image/png",
        }
      );

      navigator.mediaSession.metadata = new MediaMetadata({
        title: station.name,
        artist: station.description || "Zen Radio",
        album: "Zen Radio",
        artwork,
      });
    } else {
      navigator.mediaSession.metadata = null;
    }
  }, [station?.id, station?.name, station?.favicon, station?.description]);

  // Update playback state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (isPlaying) {
      navigator.mediaSession.playbackState = "playing";
    } else if (isPaused) {
      navigator.mediaSession.playbackState = "paused";
    } else {
      navigator.mediaSession.playbackState = "none";
    }
  }, [isPlaying, isPaused]);
}
