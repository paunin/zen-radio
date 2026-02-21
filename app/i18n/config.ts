import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import de from "./locales/de/translation.json";
import ja from "./locales/ja/translation.json";
import ru from "./locales/ru/translation.json";
import zh from "./locales/zh/translation.json";
import pt from "./locales/pt/translation.json";
import ko from "./locales/ko/translation.json";
import it from "./locales/it/translation.json";

export async function initI18n() {
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
        ja: { translation: ja },
        ru: { translation: ru },
        zh: { translation: zh },
        pt: { translation: pt },
        ko: { translation: ko },
        it: { translation: it },
      },
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "radioLanguage",
      },
    });

  return i18n;
}

export default i18n;
