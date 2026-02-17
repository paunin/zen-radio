import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { Icon } from "~/components/ui/Icon";
import { StationRow } from "./StationRow";

export function FavoritesSection() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();
  const [expanded, setExpanded] = useState(true);

  if (state.favorites.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-3 py-2 cursor-pointer group"
      >
        <span className="text-text-label uppercase text-[0.65rem] tracking-[0.08em] group-hover:text-text-secondary transition-colors">
          {t("favorites")} ({state.favorites.length})
        </span>
        <Icon
          name={expanded ? "chevronUp" : "chevronDown"}
          size={12}
          className="text-text-label"
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-0.5">
          {state.favorites.map((station) => (
            <StationRow
              key={station.id}
              station={station}
              isCurrentStation={state.currentStation?.id === station.id}
              isPlaying={state.isPlaying && state.currentStation?.id === station.id}
              isFavorite={true}
              onPlay={actions.play}
              onToggleFavorite={actions.toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
