import type { LocaleCode } from "../locales";
import { de, type Messages, type MessageKey } from "./de";
import { en } from "./en";
import { zh } from "./zh";
import { hi } from "./hi";
import { es } from "./es";
import { fr } from "./fr";
import { ar } from "./ar";
import { bn } from "./bn";
import { pt } from "./pt";
import { ru } from "./ru";
import { ur } from "./ur";
import { id } from "./id";
import { ja } from "./ja";
import { sw } from "./sw";
import { mr } from "./mr";
import { te } from "./te";
import { tr } from "./tr";
import { ta } from "./ta";
import { vi } from "./vi";
import { ko } from "./ko";

export type { Messages, MessageKey };

export const messages: Record<LocaleCode, Messages> = {
  de,
  en,
  zh,
  hi,
  es,
  fr,
  ar,
  bn,
  pt,
  ru,
  ur,
  id,
  ja,
  sw,
  mr,
  te,
  tr,
  ta,
  vi,
  ko,
};

export function translate(
  locale: LocaleCode,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let text = messages[locale]?.[key] ?? messages.de[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
