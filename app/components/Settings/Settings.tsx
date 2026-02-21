import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { Icon } from "~/components/ui/Icon";
import { useColorScheme, THEMES, type ThemeId } from "~/hooks/useColorScheme";
import { STORAGE_KEYS } from "~/lib/storage";
import i18n from "~/i18n/config";

const LANGUAGES = [
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", native: "English" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", native: "Espa\u00f1ol" },
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", native: "Fran\u00e7ais" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", native: "Deutsch" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", native: "\u65E5\u672C\u8A9E" },
  { code: "ru", flag: "\u{1F1F7}\u{1F1FA}", native: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  { code: "zh", flag: "\u{1F1E8}\u{1F1F3}", native: "\u4E2D\u6587" },
  { code: "pt", flag: "\u{1F1E7}\u{1F1F7}", native: "Portugu\u00eas" },
  { code: "ko", flag: "\u{1F1F0}\u{1F1F7}", native: "\uD55C\uAD6D\uC5B4" },
  { code: "it", flag: "\u{1F1EE}\u{1F1F9}", native: "Italiano" },
] as const;

export function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useColorScheme();
  const currentLang = i18n.language?.substring(0, 2) ?? "en";

  const handleLanguageChange = useCallback((code: string) => {
    localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(code));
    i18n.changeLanguage(code);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-6 pt-1">
        {/* Language section */}
        <section className="mb-6">
          <h3 className="text-text-label uppercase text-[0.65rem] tracking-[0.08em] mb-2 px-1">
            {t("language")}
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {LANGUAGES.map(({ code, flag, native }) => {
              const isActive = currentLang === code;
              return (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg
                    transition-colors cursor-pointer text-left
                    ${isActive
                      ? "bg-accent-dim text-accent"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                    }`}
                >
                  <span className="text-base leading-none">{flag}</span>
                  <span className="text-sm truncate">{native}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Color scheme section */}
        <section>
          <h3 className="text-text-label uppercase text-[0.65rem] tracking-[0.08em] mb-3 px-1">
            {t("colorScheme")}
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {THEMES.map(({ id, labelKey, accent }) => {
              const isActive = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id as ThemeId)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl
                    transition-all cursor-pointer
                    ${isActive
                      ? "bg-white/8 ring-1 ring-accent/40"
                      : "hover:bg-white/5"
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full transition-shadow
                      ${isActive ? "shadow-[0_0_10px_var(--color-accent)]" : ""}`}
                    style={{ backgroundColor: accent }}
                  />
                  <span
                    className={`text-[0.6rem] leading-tight text-center
                      ${isActive ? "text-text-primary" : "text-text-secondary"}`}
                  >
                    {t(labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
