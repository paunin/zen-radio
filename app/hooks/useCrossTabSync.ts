import { useEffect, useRef } from "react";

interface UseCrossTabSyncOptions {
  isPlaying: boolean;
  onRemotePlay: () => void;
}

export function useCrossTabSync({ isPlaying, onRemotePlay }: UseCrossTabSyncOptions) {
  const tabId = useRef<string>(Math.random().toString(36).slice(2));
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel("radio-audio-sync");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (data?.type === "audio-started" && data.tabId !== tabId.current) {
        onRemotePlay();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [onRemotePlay]);

  // Broadcast when this tab starts playing
  useEffect(() => {
    if (isPlaying && channelRef.current) {
      channelRef.current.postMessage({
        type: "audio-started",
        tabId: tabId.current,
      });
    }
  }, [isPlaying]);
}
