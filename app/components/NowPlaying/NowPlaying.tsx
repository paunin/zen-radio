import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { Equalizer } from "./Equalizer";
import { BufferingPulse } from "./BufferingPulse";
import { Badge } from "~/components/ui/Badge";
import { Icon } from "~/components/ui/Icon";
import { formatBitrate } from "~/lib/formatters";

export function NowPlaying() {
  const { t } = useTranslation();
  const { state } = useRadio();
  const { currentStation, isPlaying, isPaused, isBuffering } = state;

  if (!currentStation && !isBuffering) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Icon name="music" size={28} className="text-text-secondary opacity-40 flex-shrink-0" />
        <p className="text-text-secondary text-sm">{t("nothingPlaying")}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1 min-w-0">
      {/* Station favicon */}
      {currentStation?.favicon && (
        <img
          src={currentStation.favicon}
          alt=""
          className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Text info */}
      <div className="flex-1 min-w-0">
        {/* Station name + playback indicator */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-semibold text-text-primary leading-tight truncate">
            {currentStation?.name}
          </h1>
          <div className="flex-shrink-0">
            {isBuffering && <BufferingPulse />}
            {isPlaying && !isBuffering && <Equalizer isPlaying={true} />}
            {isPaused && <Icon name="pause" size={14} className="text-text-secondary" />}
          </div>
        </div>

        {/* Description */}
        {currentStation?.description && (
          <p className="text-text-secondary text-xs truncate mt-0.5">
            {currentStation.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {currentStation?.codec && <Badge>{currentStation.codec}</Badge>}
          {currentStation?.bitrate ? (
            <Badge>
              <Icon name="waveform" size={8} />
              {formatBitrate(currentStation.bitrate)}
            </Badge>
          ) : null}
          {currentStation?.source && <Badge>{currentStation.source}</Badge>}
        </div>
      </div>
    </div>
  );
}
