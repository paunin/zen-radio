import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Station } from "~/types/station";
import { Icon } from "~/components/ui/Icon";
import { PlayingIndicator } from "./PlayingIndicator";

function getShareUrl(station: Station): string {
  const uuid = station.id.replace(/^rb-/, "");
  return `${window.location.origin}/?s=${uuid}`;
}

interface StationRowProps {
  station: Station;
  isCurrentStation: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  showStats?: boolean;
  onPlay: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  children?: React.ReactNode;
}

export const StationRow = memo(function StationRow({
  station,
  isCurrentStation,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  children,
}: StationRowProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = getShareUrl(station);

      if (navigator.share) {
        try {
          await navigator.share({ title: station.name, url });
        } catch {
          // User cancelled or share failed — ignore
        }
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [station]
  );

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
        transition-colors duration-150 group min-h-[44px]
        ${isCurrentStation ? "bg-playing text-accent" : "hover:bg-hover text-text-primary"}
      `}
      onClick={() => onPlay(station)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(station);
        }
      }}
    >
      {/* Playing indicator or station icon */}
      <div className="w-5 flex-shrink-0 flex items-center justify-center">
        {isCurrentStation && isPlaying ? (
          <PlayingIndicator />
        ) : (
          <Icon name="music" size={14} className="text-text-secondary opacity-40" />
        )}
      </div>

      {/* Station info */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium truncate ${isCurrentStation ? "text-accent" : ""}`}
        >
          {station.name}
        </div>
        {station.description && (
          <div className="text-[0.7rem] text-text-secondary truncate">
            {station.description}
          </div>
        )}
        {children}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex-shrink-0 p-1 rounded transition-colors duration-150 cursor-pointer text-text-secondary/30 hover:text-accent"
        aria-label={t("share")}
      >
        {copied ? (
          <span className="text-[0.6rem] text-accent leading-none">{t("linkCopied")}</span>
        ) : (
          <Icon name="share" size={18} />
        )}
      </button>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(station);
        }}
        className={`
          flex-shrink-0 p-1 rounded transition-colors duration-150 cursor-pointer
          ${isFavorite
            ? "text-yellow-400 hover:text-yellow-300"
            : "text-text-secondary/30 hover:text-yellow-400"
          }
        `}
        aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
      >
        <Icon name={isFavorite ? "star" : "starOutline"} size={32} />
      </button>
    </div>
  );
});
