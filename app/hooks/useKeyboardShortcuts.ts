import { useEffect } from "react";

interface UseKeyboardShortcutsOptions {
  onTogglePlayPause: () => void;
  onStop: () => void;
  onFocusSearch: () => void;
}

export function useKeyboardShortcuts({
  onTogglePlayPause,
  onStop,
  onFocusSearch,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        onFocusSearch();
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          onTogglePlayPause();
          break;
        case "Escape":
          onStop();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onTogglePlayPause, onStop, onFocusSearch]);
}
