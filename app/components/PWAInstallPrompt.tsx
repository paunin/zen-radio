import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

const PWAPrompt = lazy(() => import("react-ios-pwa-prompt"));

function PWAInstallPromptInner() {
  const { t } = useTranslation();

  return (
    <PWAPrompt
      promptOnVisit={1}
      timesToShow={3}
      delay={2000}
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
