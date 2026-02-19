import { useTranslation } from "react-i18next";
import type { Station } from "~/types/station";
import { useRadio } from "~/context/RadioContext";
import { StationRow } from "./StationRow";
import { StationStats } from "./StationStats";
import { SwipeableRow } from "./SwipeableRow";

interface SearchResultsProps {
  results: Station[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
}

export function SearchResults({
  results,
  isSearching,
  error,
  hasSearched,
}: SearchResultsProps) {
  const { t } = useTranslation();
  const { state, actions } = useRadio();

  if (isSearching) {
    return (
      <div className="py-6 flex flex-col items-center gap-2">
        <div className="flex items-end gap-1 h-5">
          {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-accent/60"
              style={{
                height: "100%",
                animation: `radioLoadBounce 1s ease-in-out ${delay}s infinite`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        <span className="text-text-secondary text-xs">{t("searching")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-text-secondary text-sm">
        {t(error)}
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="py-6 text-center text-text-secondary text-sm">
        {t("noResults")}
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div>
      <div className="text-text-label uppercase text-[0.65rem] tracking-[0.08em] px-3 py-2">
        {t("results")} ({results.length})
      </div>
      <div className="flex flex-col gap-0.5">
        {results.map((station) => {
          const isFav = actions.isFavorite(station.id);
          return (
          <SwipeableRow
            key={station.id}
            onSwipeRight={() => actions.toggleFavorite(station)}
            rightIcon={isFav ? "starOutline" : "star"}
            rightLabel={isFav ? t("swipeUnfav") : t("swipeFav")}
          >
            <StationRow
              station={station}
              isCurrentStation={state.currentStation?.id === station.id}
              isPlaying={state.isPlaying && state.currentStation?.id === station.id}
              isBuffering={state.isBuffering && state.currentStation?.id === station.id}
              isFavorite={actions.isFavorite(station.id)}
              onPlay={actions.play}
              onToggleFavorite={actions.toggleFavorite}
            >
              <StationStats
                votes={station.votes}
                clickcount={station.clickcount}
                clicktrend={station.clicktrend}
                bitrate={station.bitrate}
              />
            </StationRow>
          </SwipeableRow>
          );
        })}
      </div>
    </div>
  );
}
