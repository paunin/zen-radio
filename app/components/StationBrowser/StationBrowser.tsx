import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRadio } from "~/context/RadioContext";
import { useStationSearch } from "~/hooks/useStationSearch";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { FavoritesSection } from "./FavoritesSection";
import { RecentSection } from "./RecentSection";

function EmptyState() {
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
  const isSearchActive = search.query.length > 0;
  const hasContent = state.favorites.length > 0 || state.recentStations.length > 0;
  const prevStationId = useRef(state.currentStation?.id);

  useEffect(() => {
    if (state.currentStation?.id && state.currentStation.id !== prevStationId.current && isSearchActive) {
      search.clearSearch();
    }
    prevStationId.current = state.currentStation?.id;
  }, [state.currentStation?.id, isSearchActive, search]);

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="px-3 pt-1">
        <SearchBar
          ref={searchInputRef}
          query={search.query}
          onChange={search.setQuery}
          onClear={search.clearSearch}
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
        ) : hasContent ? (
          <div className="flex flex-col gap-2">
            <FavoritesSection />
            <RecentSection />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
