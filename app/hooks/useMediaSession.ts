import { useEffect, useRef } from "react";
import type { Station } from "~/types/station";

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
    // Unsupported action on this browser
  }
}

/**
 * Set MediaSession metadata imperatively (call from play actions, not effects).
 * Mirrors zen-launcher's updateMediaSession().
 */
export function setMediaSessionMetadata(station: Station | null) {
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
      artist: station.tags || "Zen Radio",
      album: "Zen Radio",
      artwork,
    });
  }
}

/**
 * Set playbackState imperatively (call from play/pause/stop actions, not effects).
 * Mirrors zen-launcher's direct playbackState assignments.
 */
export function setMediaSessionPlaybackState(
  state: "playing" | "paused" | "none"
) {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = state;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

interface UseMediaSessionOptions {
  onTogglePlayPause: () => void;
  onPause: () => void;
  onStop: () => void;
  onNextTrack?: () => void;
  onPreviousTrack?: () => void;
}

/**
 * Register MediaSession action handlers ONCE on mount (like zen-launcher's initMediaSession).
 * Handlers read current callbacks via refs — no re-registration needed.
 *
 * In standalone PWA mode, pause triggers stop instead — iOS suspends the
 * web process after ~30 s so resume from lock screen never works reliably.
 * Stopping clears the media widget, which is cleaner than a broken pause.
 */
export function useMediaSession({
  onTogglePlayPause,
  onPause,
  onStop,
  onNextTrack,
  onPreviousTrack,
}: UseMediaSessionOptions) {
  const toggleRef = useRef(onTogglePlayPause);
  const pauseRef = useRef(onPause);
  const stopRef = useRef(onStop);
  const nextRef = useRef(onNextTrack);
  const prevRef = useRef(onPreviousTrack);
  toggleRef.current = onTogglePlayPause;
  pauseRef.current = onPause;
  stopRef.current = onStop;
  nextRef.current = onNextTrack;
  prevRef.current = onPreviousTrack;

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const standalone = isStandalone();

    trySetHandler("play", () => toggleRef.current());
    trySetHandler("pause", () => pauseRef.current());
    trySetHandler("stop", () => stopRef.current());

    trySetHandler("nexttrack", () => nextRef.current?.());
    trySetHandler("previoustrack", () => prevRef.current?.());
    trySetHandler("seekto", () => {});
  }, []);
}
