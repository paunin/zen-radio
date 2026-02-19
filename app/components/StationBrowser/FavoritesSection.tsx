import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { StationRow } from "./StationRow";
import { SwipeableRow } from "./SwipeableRow";

export function FavoritesSection() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();

  if (state.favorites.length === 0) return null;

  return (
    <div>
      <div className="px-3 py-2">
        <span className="text-text-label uppercase text-[0.65rem] tracking-[0.08em]">
          {t("favorites")} ({state.favorites.length})
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {state.favorites.map((station) => (
          <SwipeableRow
            key={station.id}
            onSwipeRight={() => {}}
            onSwipeLeft={() => actions.toggleFavorite(station)}
            rightIcon="star"
            rightLabel={t("swipeFav")}
            leftIcon="starOutline"
            leftLabel={t("swipeUnfav")}
          >
            <StationRow
              station={station}
              isCurrentStation={state.currentStation?.id === station.id}
              isPlaying={state.isPlaying && state.currentStation?.id === station.id}
              isBuffering={state.isBuffering && state.currentStation?.id === station.id}
              isFavorite={true}
              onPlay={actions.play}
              onToggleFavorite={actions.toggleFavorite}
            />
          </SwipeableRow>
        ))}
      </div>
    </div>
  );
}
