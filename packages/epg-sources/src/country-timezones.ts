/** Default output timezone for merged country EPG feeds. */
export const COUNTRY_OUTPUT_TIMEZONES: Readonly<Record<string, string>> = {
  AT: "Europe/Vienna",
  CH: "Europe/Zurich",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  GB: "Europe/London",
  NL: "Europe/Amsterdam",
};

export function getCountryOutputTimeZone(countryCode: string): string | null {
  return COUNTRY_OUTPUT_TIMEZONES[countryCode.toUpperCase()] ?? null;
}
