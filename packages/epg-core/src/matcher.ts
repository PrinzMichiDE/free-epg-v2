export interface XmltvChannel {
  id: string;
  displayName: string;
  icon?: string;
}

export interface XmltvProgramme {
  channel: string;
  start: string;
  stop: string;
  title: string;
  desc?: string;
  category?: string;
}

export interface XmltvDocument {
  channels: XmltvChannel[];
  programmes: XmltvProgramme[];
}

export function normalizeXmltvId(id: string): string {
  return id.trim().replace(/[_\s]+/g, ".").replace(/\.+/g, ".");
}

export function normalizeChannelName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function similarityScore(a: string, b: string): number {
  const na = normalizeChannelName(a);
  const nb = normalizeChannelName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const setA = new Set(na.split(" "));
  const setB = new Set(nb.split(" "));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export interface ChannelRecord {
  xmltvId: string;
  name: string;
  altNames?: string[];
  country?: string;
}

export interface MatchResult {
  xmltvId: string;
  confidence: number;
  method: string;
}

export function matchChannel(
  tvgId: string | undefined,
  tvgName: string | undefined,
  groupTitle: string | undefined,
  catalog: ChannelRecord[],
  overrides?: Map<string, string>
): MatchResult | null {
  const normalizedName = tvgName ? normalizeChannelName(tvgName) : "";

  if (normalizedName && overrides?.has(normalizedName)) {
    return {
      xmltvId: overrides.get(normalizedName)!,
      confidence: 100,
      method: "override",
    };
  }

  if (tvgId) {
    const exact = catalog.find((c) => c.xmltvId === tvgId);
    if (exact) {
      return { xmltvId: exact.xmltvId, confidence: 100, method: "exact_id" };
    }

    const normalized = normalizeXmltvId(tvgId);
    const normMatch = catalog.find(
      (c) => normalizeXmltvId(c.xmltvId).toLowerCase() === normalized.toLowerCase()
    );
    if (normMatch) {
      return { xmltvId: normMatch.xmltvId, confidence: 95, method: "normalized_id" };
    }
  }

  if (tvgName) {
    const exactName = catalog.find(
      (c) => normalizeChannelName(c.name) === normalizedName
    );
    if (exactName) {
      return { xmltvId: exactName.xmltvId, confidence: 90, method: "exact_name" };
    }

    let best: MatchResult | null = null;
    for (const ch of catalog) {
      const names = [ch.name, ...(ch.altNames ?? [])];
      for (const n of names) {
        const score = similarityScore(tvgName, n);
        if (score >= 0.6 && (!best || score > best.confidence / 100)) {
          best = {
            xmltvId: ch.xmltvId,
            confidence: Math.round(score * 100),
            method: "fuzzy_name",
          };
        }
      }
    }
    if (best) return best;

    if (groupTitle) {
      const countryHint = groupTitle.slice(0, 2).toUpperCase();
      for (const ch of catalog) {
        if (ch.country === countryHint) {
          const score = similarityScore(tvgName, ch.name);
          if (score >= 0.6) {
            return {
              xmltvId: ch.xmltvId,
              confidence: Math.round(score * 85),
              method: "group_name",
            };
          }
        }
      }
    }
  }

  return null;
}
