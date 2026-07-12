import { buildRytecSourcesXml, rytecCountryCode } from "@freeepg/epg-core";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { BASE_URL } from "@/lib/utils";

const COUNTRY_LABELS: Record<string, string> = {
  AU: "Australia",
  BR: "Brazil",
  CA: "Canada",
  CN: "China",
  DE: "Deutschland",
  FR: "France",
  GB: "UK/Ireland",
  HK: "Hong Kong",
  ID: "Indonesia",
  IN: "India",
  JP: "Japan",
  MY: "Malaysia",
  NZ: "New Zealand",
  PH: "Philippines",
  RU: "Russia",
  SG: "Singapore",
  TW: "Taiwan",
  US: "United States",
  VN: "Vietnam",
  ZA: "South Africa",
};

export async function GET() {
  const entries = EPG_PW_COUNTRIES.map((country) => {
    const cc = country.toLowerCase();
    const label = COUNTRY_LABELS[country] ?? country;
    return {
      country,
      description: `${label} — FreeEPG (${rytecCountryCode(country)})`,
      epgUrl: `${BASE_URL}/api/epg/rytec/${cc}.xml.gz`,
      channelsUrl: `${BASE_URL}/api/epg/rytec/channels/${cc}.xml`,
    };
  });

  const xml = buildRytecSourcesXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
