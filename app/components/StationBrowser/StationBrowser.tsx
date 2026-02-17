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
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <img
        src="/images/icon-192.png"
        alt="Zen Radio"
        className="w-20 h-20 rounded-2xl opacity-60"
      />
      <div className="flex flex-col gap-2 max-w-xs">
        <h2 className="text-lg font-semibold text-text-primary/70">
          {t("welcomeTitle")}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {t("welcomeDescription")}
        </p>
      </div>
      <p className="text-xs text-text-secondary/50 mt-2">
        {t("welcomeHint")}
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
