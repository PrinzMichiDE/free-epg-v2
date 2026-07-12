export const LOCALE_COOKIE = "freeepg_locale";

export const LOCALES = [
  { code: "en", nativeName: "English", dir: "ltr" as const },
  { code: "zh", nativeName: "中文", dir: "ltr" as const },
  { code: "hi", nativeName: "हिन्दी", dir: "ltr" as const },
  { code: "es", nativeName: "Español", dir: "ltr" as const },
  { code: "fr", nativeName: "Français", dir: "ltr" as const },
  { code: "ar", nativeName: "العربية", dir: "rtl" as const },
  { code: "bn", nativeName: "বাংলা", dir: "ltr" as const },
  { code: "pt", nativeName: "Português", dir: "ltr" as const },
  { code: "ru", nativeName: "Русский", dir: "ltr" as const },
  { code: "ur", nativeName: "اردو", dir: "rtl" as const },
  { code: "id", nativeName: "Bahasa Indonesia", dir: "ltr" as const },
  { code: "de", nativeName: "Deutsch", dir: "ltr" as const },
  { code: "ja", nativeName: "日本語", dir: "ltr" as const },
  { code: "sw", nativeName: "Kiswahili", dir: "ltr" as const },
  { code: "mr", nativeName: "मराठी", dir: "ltr" as const },
  { code: "te", nativeName: "తెలుగు", dir: "ltr" as const },
  { code: "tr", nativeName: "Türkçe", dir: "ltr" as const },
  { code: "ta", nativeName: "தமிழ்", dir: "ltr" as const },
  { code: "vi", nativeName: "Tiếng Việt", dir: "ltr" as const },
  { code: "ko", nativeName: "한국어", dir: "ltr" as const },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "de";

export const LOCALE_CODES = LOCALES.map((l) => l.code) as LocaleCode[];

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALE_CODES.includes(value as LocaleCode);
}

export function getLocaleMeta(code: LocaleCode) {
  return LOCALES.find((l) => l.code === code)!;
}
