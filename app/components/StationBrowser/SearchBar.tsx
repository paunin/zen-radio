import { useTranslation } from "react-i18next";
import { Icon } from "~/components/ui/Icon";
import { forwardRef } from "react";

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onClear: () => void;
  onFocusChange?: (focused: boolean) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ query, onChange, onClear, onFocusChange }, ref) {
    const { t } = useTranslation();

    return (
      <div className="relative">
        <Icon
          name="search"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-white/5 border border-border
            text-base text-text-primary placeholder:text-text-secondary/60
            focus:outline-none focus:border-accent/30 focus:bg-white/8
            transition-colors duration-200"
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded
              text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Clear"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
    );
  }
);
