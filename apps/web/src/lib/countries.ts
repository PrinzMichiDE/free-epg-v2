/** ISO 3166-1 alpha-2 → deutscher Anzeigename (Overrides für Kurzformen). */
export const COUNTRY_NAMES: Record<string, string> = {
  AU: "Australien",
  BR: "Brasilien",
  CA: "Kanada",
  CN: "China",
  DE: "Deutschland",
  FR: "Frankreich",
  GB: "Vereinigtes Königreich",
  HK: "Hongkong",
  ID: "Indonesien",
  IN: "Indien",
  JP: "Japan",
  MY: "Malaysia",
  NZ: "Neuseeland",
  PH: "Philippinen",
  RU: "Russland",
  SG: "Singapur",
  TW: "Taiwan",
  US: "USA",
  VN: "Vietnam",
  ZA: "Südafrika",
};

let germanRegionNames: Intl.DisplayNames | undefined;

function getGermanRegionNames(): Intl.DisplayNames {
  if (!germanRegionNames) {
    germanRegionNames = new Intl.DisplayNames(["de"], { type: "region" });
  }
  return germanRegionNames;
}

export function getCountryName(
  code: string,
  worldNames?: Record<string, string>
): string {
  const cc = code.toUpperCase();
  if (COUNTRY_NAMES[cc]) return COUNTRY_NAMES[cc];
  if (worldNames?.[cc]) return worldNames[cc];

  const localized = getGermanRegionNames().of(cc);
  if (localized && localized !== cc) return localized;

  return cc;
}
