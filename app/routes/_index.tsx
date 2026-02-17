import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { RadioProvider, useRadio } from "~/context/RadioContext";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";
import { AppShell } from "~/components/Layout/AppShell";
import { TransportControls } from "~/components/TransportControls/TransportControls";
import { StationBrowser } from "~/components/StationBrowser/StationBrowser";
import { Toast } from "~/components/ui/Toast";
import { PWAInstallPrompt } from "~/components/PWAInstallPrompt";
import { getStationByUUID } from "~/lib/api";

function RadioApp() {
  const { t } = useTranslation();
  const { state, actions, searchInputRef } = useRadio();
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    if (deepLinkHandled.current) return;
    deepLinkHandled.current = true;

    const params = new URLSearchParams(window.location.search);
    const uuid = params.get("s");
    if (!uuid) return;

    window.history.replaceState({}, "", window.location.pathname);

    getStationByUUID(uuid).then((station) => {
      if (station) actions.load(station);
    });
  }, [actions]);

  useEffect(() => {
    if (state.currentStation && (state.isPlaying || state.isPaused)) {
      document.title = `${state.currentStation.name} — Zen Radio`;
    } else {
      document.title = "Zen Radio";
    }
  }, [state.currentStation?.name, state.isPlaying, state.isPaused]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, [searchInputRef]);

  useKeyboardShortcuts({
    onTogglePlayPause: actions.togglePlayPause,
    onStop: actions.stop,
    onFocusSearch: focusSearch,
  });

  const dismissError = useCallback(() => {
    // Error auto-dismisses via toast
  }, []);

  return (
    <AppShell>
      <Toast
        message={state.error ? t(state.error) : null}
        onDismiss={dismissError}
      />

      {/* Station browser — takes remaining space */}
      <div className="flex-1 min-h-0 pt-2">
        <StationBrowser />
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-4 flex-shrink-0" />

      {/* Transport controls — pinned to bottom for thumb access */}
      <div className="flex-shrink-0 pb-[env(safe-area-inset-bottom)]">
        <TransportControls />
      </div>

      <PWAInstallPrompt />
    </AppShell>
  );
}

export default function Index() {
  return (
    <RadioProvider>
      <RadioApp />
    </RadioProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="flex items-center justify-center h-dvh bg-bg text-text-primary">
      <div className="text-center p-8">
        <h1 className="text-2xl font-semibold mb-2">
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : "Something went wrong"}
        </h1>
        <p className="text-text-secondary">
          Please refresh the page and try again.
        </p>
      </div>
    </div>
  );
}
