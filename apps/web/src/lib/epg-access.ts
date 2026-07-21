import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";

export const LIST_ID_PATTERN = /^[a-f0-9]{8}$/i;
export const EPG_COUNTRY_PATTERN = /^[A-Z]{2}$/;

export function normalizeEpgCountryParam(raw: string): string {
  return raw.replace(/\.xml\.gz$|\.xml$/i, "").toUpperCase();
}

export function isSupportedEpgCountry(country: string): boolean {
  const cc = country.toUpperCase();
  return EPG_COUNTRY_PATTERN.test(cc) && SUPPORTED_EPG_COUNTRIES.includes(cc);
}

export function isValidListId(id: string): boolean {
  return LIST_ID_PATTERN.test(id);
}
