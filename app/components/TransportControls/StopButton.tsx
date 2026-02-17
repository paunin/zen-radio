import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "~/components/ui/Icon";

interface StopButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const StopButton = memo(function StopButton({ onClick, disabled }: StopButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${disabled
          ? "text-text-secondary/30 cursor-default"
          : "text-text-secondary hover:text-text-primary hover:bg-white/8"
        }
        active:scale-95
      `}
      aria-label={t("stop")}
    >
      <Icon name="stop" size={20} />
    </button>
  );
});
