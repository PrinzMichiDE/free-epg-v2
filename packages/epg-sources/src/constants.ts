import { GLOBETV_APP_COUNTRIES } from "./globetv-countries.js";

/** Countries with feeds on epg.pw (subset of supported regions). */
export const EPG_PW_COUNTRIES = [
  "AE", "AR", "AT", "AU", "BA", "BE", "BG", "BO", "BR", "BS", "CA", "CH",
  "CL", "CO", "CR", "CZ", "DE", "DK", "DO", "EC", "EG", "ES", "FI", "FR",
  "GB", "GR", "GT", "HK", "HN", "HR", "HU", "ID", "IE", "IL", "IN", "IS",
  "IT", "JM", "KR", "LT", "LU", "LV", "MX", "MY", "NL", "NO", "NZ", "PA",
  "PE", "PH", "PK", "PL", "PR", "PT", "PY", "QA", "RO", "RS", "RU", "SA",
  "SE", "SG", "SI", "SK", "TH", "TR", "TT", "TW", "UA", "US", "UY", "VE",
  "VN", "ZA",
] as const;

/** Countries with per-country XML on iptv-epg.org (see https://iptv-epg.org/). */
export const IPTV_EPG_ORG_COUNTRIES = [
  "AE", "AF", "AL", "AM", "AO", "AR", "AT", "AU", "AZ", "BA", "BB", "BE",
  "BF", "BG", "BH", "BI", "BJ", "BO", "BR", "BS", "BT", "BW", "BY", "CA",
  "CD", "CH", "CI", "CL", "CM", "CN", "CO", "CR", "CU", "CW", "CY", "CZ",
  "DE", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ES", "ET", "FI", "FJ",
  "FR", "GB", "GE", "GH", "GR", "GT", "GW", "HN", "HK", "HR", "HT", "HU",
  "ID", "IL", "IN", "IQ", "IR", "IS", "IT", "JM", "JO", "JP", "KE", "KG",
  "KH", "KR", "KW", "KZ", "LA", "LB", "LC", "LK", "LT", "LU", "LV", "MA",
  "MC", "MD", "ME", "MG", "MK", "ML", "MM", "MN", "MO", "MR", "MT", "MU",
  "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL", "NO", "NP", "NR",
  "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PR", "PS", "PT", "PY",
  "QA", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SE", "SG", "SI", "SK",
  "SL", "SV", "SY", "TH", "TL", "TN", "TO", "TR", "TT", "TW", "TZ", "UA",
  "UG", "US", "UY", "UZ", "VE", "VN", "VU", "ZA", "ZW",
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
