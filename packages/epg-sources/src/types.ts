import type { XmltvDocument } from "@freeepg/epg-core";

export interface EpgSourceAdapter {
  name: string;
  type: string;
  priority: number;
  fetchCountry(countryCode: string): Promise<XmltvDocument | null>;
  fetchGlobal?(): Promise<XmltvDocument | null>;
}
