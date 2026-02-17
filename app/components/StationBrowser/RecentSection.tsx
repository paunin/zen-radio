import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { StationRow } from "./StationRow";

const INITIAL_SHOW = 5;

export function RecentSection() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();
  const [showAll, setShowAll] = useState(false);

  if (state.recentStations.length === 0) return null;

  const visibleStations = showAll
    ? state.recentStations
    : state.recentStations.slice(0, INITIAL_SHOW);
  const hasMore = state.recentStations.length > INITIAL_SHOW;

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-text-label uppercase text-[0.65rem] tracking-[0.08em]">
          {t("recent")} ({state.recentStations.length})
        </span>
        <button
          onClick={actions.clearRecent}
          className="text-text-secondary/50 hover:text-text-secondary text-[0.65rem]
            transition-colors cursor-pointer"
        >
          {t("clear")}
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {visibleStations.map((station) => (
          <StationRow
            key={station.id}
            station={station}
            isCurrentStation={state.currentStation?.id === station.id}
            isPlaying={state.isPlaying && state.currentStation?.id === station.id}
            isFavorite={actions.isFavorite(station.id)}
            onPlay={actions.play}
            onToggleFavorite={actions.toggleFavorite}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full px-3 py-1.5 text-accent/70 hover:text-accent text-xs
            transition-colors cursor-pointer text-center"
        >
          {showAll
            ? t("showLess")
            : `${t("showMore")} (${state.recentStations.length - INITIAL_SHOW})`}
        </button>
      )}
    </div>
  );
}
