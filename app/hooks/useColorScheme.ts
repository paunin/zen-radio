import { useState, useEffect, useCallback } from "react";
import { getItem, setItem, STORAGE_KEYS } from "~/lib/storage";

export type ThemeId =
  | "ocean"
  | "ember"
  | "amethyst"
  | "forest"
  | "rose"
  | "monochrome"
  | "sunset"
  | "aurora";

export interface ThemeDef {
  id: ThemeId;
  labelKey: string;
  accent: string;
}

export const THEMES: ThemeDef[] = [
  { id: "ocean", labelKey: "themeOcean", accent: "#64c8ff" },
  { id: "ember", labelKey: "themeEmber", accent: "#ff9f43" },
  { id: "amethyst", labelKey: "themeAmethyst", accent: "#b57aff" },
  { id: "forest", labelKey: "themeForest", accent: "#5cd67b" },
  { id: "rose", labelKey: "themeRose", accent: "#ff7eb3" },
  { id: "monochrome", labelKey: "themeMonochrome", accent: "#c0c0c0" },
  { id: "sunset", labelKey: "themeSunset", accent: "#ff6b6b" },
  { id: "aurora", labelKey: "themeAurora", accent: "#43e8d8" },
];

const DEFAULT_THEME: ThemeId = "ocean";

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
}

export function useColorScheme() {
  const [theme, setThemeState] = useState<ThemeId>(() =>
    getItem<ThemeId>(STORAGE_KEYS.colorScheme, DEFAULT_THEME)
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    setItem(STORAGE_KEYS.colorScheme, id);
    applyTheme(id);
  }, []);

  return { theme, setTheme };
}
