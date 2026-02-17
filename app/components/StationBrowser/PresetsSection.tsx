import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { PRESET_STATIONS } from "~/lib/constants";
import { StationRow } from "./StationRow";

export function PresetsSection() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();

  return (
    <div>
      <div className="text-text-label uppercase text-[0.65rem] tracking-[0.08em] px-3 py-2">
        {t("presets")}
      </div>
      <div className="flex flex-col gap-0.5">
        {PRESET_STATIONS.map((station) => (
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
    </div>
  );
}
