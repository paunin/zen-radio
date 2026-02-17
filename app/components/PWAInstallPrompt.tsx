import { lazy, Suspense, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

const PWAPrompt = lazy(() => import("react-ios-pwa-prompt"));

const DISMISS_KEY = "pwa-prompt-dismissed";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

function isDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function PWAInstallPromptInner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(isDismissed);

  const handleClose = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <PWAPrompt
      promptOnVisit={1}
      timesToShow={99}
      delay={2000}
      onClose={handleClose}
      copyTitle={t("pwaTitle")}
      copySubtitle="Zen Radio"
      copyDescription={t("pwaDescription")}
      copyShareStep={t("pwaShareStep")}
      copyAddToHomeScreenStep={t("pwaAddStep")}
      appIconPath="/images/icon-192.png"
    />
  );
}

export function PWAInstallPrompt() {
  if (typeof window === "undefined") return null;

  return (
    <Suspense fallback={null}>
      <PWAInstallPromptInner />
    </Suspense>
  );
}
