import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "~/components/ui/Icon";

interface VolumeButtonProps {
  volume: number;
  isOpen: boolean;
  onToggle: () => void;
}

function getVolumeIcon(volume: number): string {
  if (volume === 0) return "volumeMuted";
  if (volume < 33) return "volumeLow";
  if (volume < 66) return "volumeMedium";
  return "volumeHigh";
}

/** Small icon button that sits in the transport bar */
export const VolumeButton = memo(function VolumeButton({
  volume,
  isOpen,
  onToggle,
}: VolumeButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        transition-all duration-200 cursor-pointer active:scale-95
        ${isOpen
          ? "text-accent bg-white/10"
          : "text-text-secondary hover:text-text-primary hover:bg-white/8"
        }
      `}
      aria-label={t("volume")}
    >
      <Icon name={getVolumeIcon(volume)} size={20} />
    </button>
  );
});

interface VolumePanelProps {
  volume: number;
  isOpen: boolean;
  onChange: (v: number) => void;
  onClose: () => void;
}

/** Slide-up panel that replaces the transport row when open */
export const VolumePanel = memo(function VolumePanel({
  volume,
  isOpen,
  onChange,
  onClose,
}: VolumePanelProps) {
  const { t } = useTranslation();

  const handleMuteToggle = useCallback(() => {
    onChange(volume === 0 ? 75 : 0);
  }, [volume, onChange]);

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: isOpen ? "72px" : "0px", opacity: isOpen ? 1 : 0 }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
        {/* Mute button */}
        <button
          onClick={handleMuteToggle}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            transition-all duration-200 cursor-pointer active:scale-95
            ${volume === 0
              ? "text-accent bg-accent/15"
              : "text-text-secondary hover:text-text-primary hover:bg-white/8"
            }
          `}
          aria-label={volume === 0 ? "Unmute" : "Mute"}
        >
          <Icon name={volume === 0 ? "volumeMuted" : "volumeHigh"} size={20} />
        </button>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-10"
          aria-label={t("volume")}
        />

        {/* Percentage */}
        <span className="text-text-primary text-sm w-10 text-right flex-shrink-0 tabular-nums font-medium">
          {volume}%
        </span>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            text-text-secondary hover:text-text-primary hover:bg-white/8
            transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icon name="chevronDown" size={18} />
        </button>
      </div>
    </div>
  );
});
