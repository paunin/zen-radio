import { useRadio } from "~/context/RadioContext";
import { useStationSearch } from "~/hooks/useStationSearch";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { FavoritesSection } from "./FavoritesSection";
import { RecentSection } from "./RecentSection";
import { PresetsSection } from "./PresetsSection";

export function StationBrowser() {
  const { searchInputRef } = useRadio();
  const search = useStationSearch();
  const isSearchActive = search.query.length > 0;

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
        ) : (
          <div className="flex flex-col gap-2">
            <FavoritesSection />
            <RecentSection />
            <PresetsSection />
          </div>
        )}
      </div>
    </div>
  );
}
