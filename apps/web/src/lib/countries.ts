/** ISO 3166-1 alpha-2 → deutscher Anzeigename */
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

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
