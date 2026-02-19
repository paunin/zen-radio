import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { StationRow } from "./StationRow";
import { StationStats } from "./StationStats";
import { SwipeableRow } from "./SwipeableRow";

export function RecentSection() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();

  if (state.recentStations.length === 0) return null;

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
        {state.recentStations.map((station) => {
          const isFav = actions.isFavorite(station.id);
          return (
          <SwipeableRow
            key={station.id}
            onSwipeRight={() => actions.toggleFavorite(station)}
            onSwipeLeft={() => actions.removeRecent(station.id)}
            rightIcon={isFav ? "starOutline" : "star"}
            rightLabel={isFav ? t("swipeUnfav") : t("swipeFav")}
            leftLabel={t("swipeDelete")}
          >
            <StationRow
              station={station}
              isCurrentStation={state.currentStation?.id === station.id}
              isPlaying={state.isPlaying && state.currentStation?.id === station.id}
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
