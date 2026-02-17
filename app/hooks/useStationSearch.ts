import { useState, useEffect, useRef, useCallback } from "react";
import type { Station } from "~/types/station";
import { searchStations } from "~/lib/api";
import { SEARCH_DEBOUNCE_MS, MIN_SEARCH_LENGTH } from "~/lib/constants";

interface SearchState {
  query: string;
  results: Station[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
}

export function useStationSearch() {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    isSearching: false,
    error: null,
    hasSearched: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query, error: null }));
  }, []);

  const clearSearch = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({
      query: "",
      results: [],
      isSearching: false,
      error: null,
      hasSearched: false,
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (state.query.length < MIN_SEARCH_LENGTH) {
      setState((prev) => ({
        ...prev,
        results: [],
        isSearching: false,
        hasSearched: false,
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSearching: true, error: null }));

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await searchStations(state.query, controller.signal);
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            results,
            isSearching: false,
            hasSearched: true,
          }));
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            results: [],
            isSearching: false,
            hasSearched: true,
            error: "searchFailed",
          }));
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.query]);

  return {
    ...state,
    setQuery,
    clearSearch,
  };
}
