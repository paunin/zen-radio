import { memo } from "react";

export const PlayingIndicator = memo(function PlayingIndicator() {
  const bars = [0, 0.15, 0.3];

  return (
    <div className="flex items-end gap-[2px] h-3 flex-shrink-0" aria-hidden="true">
      {bars.map((delay, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-accent origin-bottom"
          style={{
            height: "100%",
            animation: `radioBarBounce 0.8s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
});
