import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { useStationSearch } from "~/hooks/useStationSearch";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { FavoritesSection } from "./FavoritesSection";
import { RecentSection } from "./RecentSection";

const SUGGESTIONS = [
  { searchTerm: "jazz", labelKey: "suggestJazz" },
  { searchTerm: "chill", labelKey: "suggestChill" },
  { searchTerm: "classical", labelKey: "suggestClassical" },
  { searchTerm: "ambient", labelKey: "suggestAmbient" },
  { searchTerm: "lofi", labelKey: "suggestLofi" },
  { searchTerm: "nature", labelKey: "suggestNature" },
  { searchTerm: "rock", labelKey: "suggestRock" },
  { searchTerm: "electronic", labelKey: "suggestElectronic" },
  { searchTerm: "blues", labelKey: "suggestBlues" },
  { searchTerm: "meditation", labelKey: "suggestMeditation" },
  { searchTerm: "pop", labelKey: "suggestPop" },
] as const;

function pickRandom(exclude: number) {
  let idx: number;
  do { idx = Math.floor(Math.random() * SUGGESTIONS.length); } while (idx === exclude);
  return idx;
}

function SuggestionPills({
  onSuggestion,
  enablePulse = false,
}: {
  onSuggestion: (term: string) => void;
  enablePulse?: boolean;
}) {
  const { t } = useTranslation();
  const [pulsingIdx, setPulsingIdx] = useState(-1);
  const lastIdx = useRef(-1);

  useEffect(() => {
    if (!enablePulse) return;
    const doPulse = () => {
      const idx = pickRandom(lastIdx.current);
      lastIdx.current = idx;
      setPulsingIdx(idx);
      setTimeout(() => setPulsingIdx(-1), 4200);
    };

    const firstTimer = setTimeout(doPulse, 10_000);
    const interval = setInterval(doPulse, 15_000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [enablePulse]);

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
      {SUGGESTIONS.map(({ searchTerm, labelKey }, i) => (
        <button
          key={searchTerm}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSuggestion(searchTerm)}
          className={`px-3 py-1.5 text-xs rounded-full
            border text-text-secondary/70
            hover:border-accent/40 hover:text-accent/90
            active:scale-95
            transition-all duration-300 cursor-pointer
            ${i === pulsingIdx ? "animate-[suggest-nudge_2s_ease-in-out_2] text-accent/60" : ""} border-border/60`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onSuggestion }: { onSuggestion: (term: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full px-6 text-center">
      <div className="flex flex-col items-center justify-center gap-5 py-12">
        <img
          src="/images/icon.svg"
          alt="Zen Radio"
          className="w-20 h-20 opacity-60"
        />
        <div className="flex flex-col gap-2 max-w-xs">
          <h2
            className="text-xl text-text-primary/70"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
          >
            Zen Radio
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t("welcomeDescription")}
          </p>
        </div>

        <SuggestionPills onSuggestion={onSuggestion} enablePulse />
      </div>
      <div className="flex-1" />
      <p className="text-xs text-text-secondary/30 pb-4">
        <a
          href="https://zen-radio.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary/40 hover:text-text-secondary/60 transition-colors"
        >
          zen-radio.app
        </a>
        {" by "}
        <a
          href="https://github.com/paunin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary/40 hover:text-text-secondary/60 transition-colors"
        >
          @paunin
        </a>
      </p>
    </div>
  );
}

export function StationBrowser() {
  const { searchInputRef, state } = useRadio();
  const search = useStationSearch();
  const [searchFocused, setSearchFocused] = useState(false);
  const isSearchActive = search.query.length > 0;
  const showSuggestions = searchFocused && !isSearchActive;
  const hasContent = state.favorites.length > 0 || state.recentStations.length > 0;

  const handleSuggestion = useCallback(
    (term: string) => {
      search.setQuery(term);
      searchInputRef.current?.focus();
    },
    [search, searchInputRef]
  );

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="px-3 pt-1">
        <SearchBar
          ref={searchInputRef}
          query={search.query}
          onChange={search.setQuery}
          onClear={search.clearSearch}
          onFocusChange={setSearchFocused}
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-4">
        {isSearchActive ? (
          <SearchResults
            results={search.results}
            isSearching={search.isSearching}
            error={search.error}
            hasSearched={search.hasSearched}
          />
        ) : showSuggestions ? (
          <div className="px-6 pt-4">
            <SuggestionPills onSuggestion={handleSuggestion} />
          </div>
        ) : hasContent ? (
          <div className="flex flex-col gap-2">
            <FavoritesSection />
            <RecentSection />
          </div>
        ) : (
          <EmptyState onSuggestion={handleSuggestion} />
        )}
      </div>
    </div>
  );
}
