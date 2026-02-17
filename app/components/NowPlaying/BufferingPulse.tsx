import { memo } from "react";

export const BufferingPulse = memo(function BufferingPulse() {
  return (
    <div
      className="flex items-center gap-1"
      style={{ animation: "radioPulse 1.2s ease-in-out infinite" }}
      aria-hidden="true"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
    </div>
  );
});
