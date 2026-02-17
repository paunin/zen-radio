import { memo } from "react";
import { Icon } from "~/components/ui/Icon";
import { Badge } from "~/components/ui/Badge";
import { formatStatNumber, formatBitrate, popularityPercent } from "~/lib/formatters";

interface StationStatsProps {
  votes?: number;
  clickcount?: number;
  clicktrend?: number;
  bitrate?: number;
}

export const StationStats = memo(function StationStats({
  votes = 0,
  clickcount = 0,
  clicktrend = 0,
  bitrate = 0,
}: StationStatsProps) {
  const popularity = popularityPercent(votes);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Popularity bar */}
      {votes > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent/60"
              style={{ width: `${popularity}%` }}
            />
          </div>
        </div>
      )}

      {/* Play count */}
      {clickcount > 0 && (
        <span className="text-[0.6rem] text-text-secondary">
          ♫ {formatStatNumber(clickcount)}
        </span>
      )}

      {/* Trend */}
      {clicktrend !== 0 && (
        <span
          className={`text-[0.6rem] ${clicktrend > 0 ? "text-accent" : "text-text-secondary/50"}`}
        >
          {clicktrend > 0 ? "▲" : "▼"}
        </span>
      )}

      {/* Bitrate */}
      {bitrate > 0 && (
        <Badge>
          <Icon name="waveform" size={8} />
          {formatBitrate(bitrate)}
        </Badge>
      )}
    </div>
  );
});
