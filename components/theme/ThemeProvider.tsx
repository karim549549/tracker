"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  THEMES, CUSTOM_THEMES_KEY,
  applyThemeCSSVars, applyThemeObject,
  type ThemeId, type CustomTheme,
} from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  customThemes: CustomTheme[];
  addCustomTheme: (t: CustomTheme) => void;
  removeCustomTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "neon-violet",
  setTheme: () => {},
  customThemes: [],
  addCustomTheme: () => {},
  removeCustomTheme: () => {},
});

function loadCustomThemes(): CustomTheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomThemes(themes: CustomTheme[]): void {
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("neon-violet");
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);

  useEffect(() => {
    const customs = loadCustomThemes();
    setCustomThemes(customs);

    const stored = localStorage.getItem("tracker-theme");
    const isSystem = stored && THEMES.some((t) => t.id === stored);
    const isCustom = stored && customs.some((t) => t.id === stored);

    if (isSystem) {
      setThemeState(stored!);
      applyThemeCSSVars(stored!, customs);
    } else if (isCustom) {
      const custom = customs.find((t) => t.id === stored)!;
      setThemeState(stored!);
      applyThemeObject(stored!, custom.cssVars, custom.fontName);
    } else {
      setThemeState("neon-violet");
      applyThemeCSSVars("neon-violet", []);
    }
  }, []);

  function setTheme(id: ThemeId) {
    setThemeState(id);
    localStorage.setItem("tracker-theme", id);
    const custom = customThemes.find((t) => t.id === id);
    if (custom) {
      applyThemeObject(id, custom.cssVars, custom.fontName);
    } else {
      applyThemeCSSVars(id, customThemes);
    }
  }

  function addCustomTheme(t: CustomTheme) {
    setCustomThemes((prev) => {
      const next = [...prev, t];
      saveCustomThemes(next);
      return next;
    });
    // Activate the new theme immediately
    setThemeState(t.id);
    localStorage.setItem("tracker-theme", t.id);
    applyThemeObject(t.id, t.cssVars);
  }

  function removeCustomTheme(id: string) {
    setCustomThemes((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveCustomThemes(next);
      return next;
    });
    // If we're removing the active theme, fall back to neon-violet
    if (theme === id) {
      setThemeState("neon-violet");
      localStorage.setItem("tracker-theme", "neon-violet");
      applyThemeCSSVars("neon-violet", []);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customThemes, addCustomTheme, removeCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
