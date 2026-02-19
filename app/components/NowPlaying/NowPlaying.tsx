import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { Equalizer } from "./Equalizer";
import { BufferingPulse } from "./BufferingPulse";
import { Badge } from "~/components/ui/Badge";
import { Icon } from "~/components/ui/Icon";
import { formatBitrate } from "~/lib/formatters";

export function NowPlaying() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();
  const { currentStation, isPlaying, isPaused, isBuffering } = state;
  const [imgFailed, setImgFailed] = useState<string | null>(null);

  const isFav = currentStation ? actions.isFavorite(currentStation.id) : false;

  const handleToggleFavorite = useCallback(() => {
    if (currentStation) actions.toggleFavorite(currentStation);
  }, [currentStation, actions]);

  if (!currentStation && !isBuffering) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Icon name="music" size={28} className="text-text-secondary opacity-40 flex-shrink-0" />
        <p className="text-text-secondary text-sm">{t("nothingPlaying")}</p>
      </div>
    );
  }

  const showFavicon =
    currentStation?.favicon && imgFailed !== currentStation.favicon;

  return (
    <div className="flex items-center gap-3 py-1 min-w-0">
      {/* Station artwork — tap to toggle favorite */}
      <div className="relative flex-shrink-0">
        <button
          onClick={handleToggleFavorite}
          className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer bg-white/5 transition-all duration-200"
          aria-label={isFav ? t("removeFromFavorites") : t("addToFavorites")}
        >
          {showFavicon ? (
            <img
              src={currentStation!.favicon!}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgFailed(currentStation!.favicon!)}
            />
          ) : (
            <img
              src="/images/icon.svg"
              alt=""
              className="w-full h-full object-contain p-1 opacity-60"
            />
          )}
        </button>
        {isFav && (
          <div className="absolute -top-1 -right-1 text-yellow-400 drop-shadow pointer-events-none">
            <Icon name="star" size={12} />
          </div>
        )}
      </div>

      {/* Text info */}
      <div className="flex-1 min-w-0">
        {/* Station name + playback indicator */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-semibold text-text-primary leading-tight truncate">
            {currentStation?.name}
          </h1>
          <div className="flex-shrink-0 w-5 h-3.5 flex items-center justify-center">
            {isBuffering && <BufferingPulse />}
            {isPlaying && !isBuffering && <Equalizer isPlaying={true} />}
            {isPaused && <Icon name="pause" size={12} className="text-text-secondary" />}
          </div>
        </div>

        {/* Tags (no country — country only shown in the station list) */}
        {currentStation?.tags && (
          <p className="text-text-secondary text-xs truncate mt-0.5">
            {currentStation.tags}
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
        </div>
      </div>
    </div>
  );
}
