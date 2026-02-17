import { memo } from "react";
import { Icon } from "~/components/ui/Icon";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  pendingPlay: boolean;
  onClick: () => void;
}

export const PlayPauseButton = memo(function PlayPauseButton({
  isPlaying,
  isPaused,
  isBuffering,
  pendingPlay,
  onClick,
}: PlayPauseButtonProps) {
  const iconName = isPlaying && !isPaused ? "pause" : "play";
  const isActive = isPlaying || isPaused;
  const shouldPulse = pendingPlay;

  return (
    <button
      onClick={onClick}
      disabled={isBuffering}
      className={`
        w-14 h-14 rounded-full flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isActive
          ? "bg-accent text-bg shadow-[0_0_20px_rgba(100,200,255,0.3)]"
          : "bg-white/10 text-text-primary hover:bg-white/15"
        }
        ${isBuffering ? "opacity-50 cursor-wait" : ""}
        ${shouldPulse ? "animate-[pulse-glow_2s_ease-in-out_infinite]" : ""}
        active:scale-95
      `}
      aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
    >
      <Icon name={iconName} size={28} />
    </button>
  );
});
