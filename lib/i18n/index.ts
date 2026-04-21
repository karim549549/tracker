import { en } from "./en";
export type { Strings } from "./en";

export const LOCALES = [
  { code: "en", name: "English", flag: "🇺🇸", available: true },
  // Future — uncomment + add translation file to enable
  // { code: "ar", name: "العربية", flag: "🇪🇬", available: false },
  // { code: "fr", name: "Français",  flag: "🇫🇷", available: false },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

const TRANSLATIONS = { en } as const;

/** Current locale — hardcoded to "en" until locale-picker is wired to state */
export const currentLocale: LocaleCode = "en";

/**
 * Returns the full strings object for the current locale.
 * Drop-in replacement: swap `en` for `translations[locale]` when more locales land.
 */
export function useTranslations() {
  return TRANSLATIONS[currentLocale];
}
