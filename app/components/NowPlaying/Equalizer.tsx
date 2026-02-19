import { memo } from "react";

interface EqualizerProps {
  isPlaying: boolean;
}

export const Equalizer = memo(function Equalizer({ isPlaying }: EqualizerProps) {
  const bars = [0, 0.2, 0.4, 0.1, 0.3];

  return (
    <div className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
      {bars.map((delay, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-accent origin-bottom"
          style={{
            height: "100%",
            animation: isPlaying
              ? `radioBarBounce 0.8s ease-in-out ${delay}s infinite`
              : "none",
            transform: isPlaying ? undefined : "scaleY(0.4)",
            transition: "transform 0.3s ease",
          }}
        />
      ))}
    </div>
  );
});
