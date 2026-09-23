import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { getCountryName } from "./countries";

export const EPG_FRESH_MAX_AGE_HOURS = 25;

export type EpgCountryStatus = "fresh" | "stale" | "missing";

export interface EpgCountryFreshness {
  country: string;
  name: string;
  lastUpdated: string | null;
  ageHours: number | null;
  status: EpgCountryStatus;
}

export function classifyEpgFreshness(
  generatedAt: Date | null,
  now: Date,
  maxAgeHours: number = EPG_FRESH_MAX_AGE_HOURS
): EpgCountryStatus {
  if (!generatedAt) return "missing";
  const ageHours = (now.getTime() - generatedAt.getTime()) / 3_600_000;
  if (Number.isNaN(ageHours) || ageHours > maxAgeHours) return "stale";
  return "fresh";
}

export function buildEpgCountryStatuses(
  lastGeneratedByCountry: Map<string, Date>,
  countries: string[] = SUPPORTED_EPG_COUNTRIES,
  now: Date = new Date()
): EpgCountryFreshness[] {
  return countries.map((country) => {
    const lastUpdated = lastGeneratedByCountry.get(country) ?? null;
    const ageHours = lastUpdated
      ? Math.max(0, (now.getTime() - lastUpdated.getTime()) / 3_600_000)
      : null;
    return {
      country,
      name: getCountryName(country),
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      ageHours: ageHours !== null ? Math.round(ageHours * 10) / 10 : null,
      status: classifyEpgFreshness(lastUpdated, now),
    };
  });
}
