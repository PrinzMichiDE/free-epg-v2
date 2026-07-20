import { GLOBETV_APP_COUNTRIES } from "./globetv-countries.js";

/** Countries with feeds on epg.pw (subset of supported regions). */
export const EPG_PW_COUNTRIES = [
  "AU", "BR", "CA", "CN", "DE", "FR", "GB", "HK", "ID", "IN",
  "JP", "MY", "NZ", "PH", "RU", "SG", "TW", "US", "VN", "ZA",
] as const;

/** Countries with per-country XML on iptv-epg.org (see https://iptv-epg.org/). */
export const IPTV_EPG_ORG_COUNTRIES = [
  "AE", "AL", "AM", "AR", "AT", "AU", "BA", "BE", "BG", "BO", "BR", "BS", "BY",
  "CA", "CH", "CL", "CO", "CR", "CW", "CZ", "DE", "DK", "DO", "EG", "ES", "FI",
  "FR", "GB", "GE", "GH", "GR", "GT", "HN", "HK", "HR", "HU", "ID", "IL", "IN",
  "IS", "IT", "JM", "KR", "LB", "LT", "LU", "ME", "MK", "MT", "MX", "MY", "NG",
  "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "RS", "RU",
  "SE", "SG", "SI", "SV", "TH", "TR", "TT", "TW", "UA", "UG", "US", "UY", "VE",
  "ZA", "ZW",
] as const;

export { GLOBETV_APP_COUNTRIES };

/** All regions for which merged country EPG can be built from configured adapters. */
export const SUPPORTED_EPG_COUNTRIES = [
  ...new Set([
    ...EPG_PW_COUNTRIES,
    ...IPTV_EPG_ORG_COUNTRIES,
    ...GLOBETV_APP_COUNTRIES,
  ]),
].sort() as string[];
