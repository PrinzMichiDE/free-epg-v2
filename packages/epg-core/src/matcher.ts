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
    .replace(/\b(hd|sd|fhd|uhd|4k|1080p|720p|hevc|h265)\b/g, "")
    .replace(/\+|\*/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function similarityScore(a: string, b: string): number {
  const na = normalizeChannelName(a);
  const nb = normalizeChannelName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;

  const setA = new Set(na.split(" ").filter(Boolean));
  const setB = new Set(nb.split(" ").filter(Boolean));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  const jaccard = union === 0 ? 0 : intersection / union;

  const maxLen = Math.max(na.length, nb.length);
  const levenshtein = maxLen === 0 ? 1 : 1 - levenshteinDistance(na, nb) / maxLen;

  const combined = jaccard * 0.6 + levenshtein * 0.4;

  if (combined >= 0.8 && intersection >= Math.min(setA.size, setB.size) * 0.5) {
    return Math.min(0.95, combined + 0.1);
  }

  return combined;
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

    if (tvgName) {
      const tvgIdNorm = normalizeChannelName(tvgId.replace(/[_:.]/g, " "));
      if (tvgIdNorm) {
        const idNameMatch = catalog.find((c) => normalizeChannelName(c.name) === tvgIdNorm);
        if (idNameMatch) {
          return { xmltvId: idNameMatch.xmltvId, confidence: 90, method: "id_as_name" };
        }
      }
    }
  }

  if (tvgName) {
    const exactName = catalog.find(
      (c) => normalizeChannelName(c.name) === normalizedName
    );
    if (exactName) {
      return { xmltvId: exactName.xmltvId, confidence: 95, method: "exact_name" };
    }

    for (const ch of catalog) {
      const altNames = ch.altNames ?? [];
      for (const alt of altNames) {
        if (normalizeChannelName(alt) === normalizedName) {
          return { xmltvId: ch.xmltvId, confidence: 95, method: "alt_name_exact" };
        }
      }
    }

    let best: MatchResult | null = null;
    for (const ch of catalog) {
      const names = [ch.name, ...(ch.altNames ?? [])];
      for (const n of names) {
        const score = similarityScore(tvgName, n);
        if (score >= 0.65 && (!best || score > best.confidence / 100)) {
          best = {
            xmltvId: ch.xmltvId,
            confidence: Math.round(score * 100),
            method: "fuzzy_name",
          };
        }
      }
    }
    if (best && best.confidence >= 70) return best;
    if (best && best.confidence >= 65) {
      if (groupTitle) {
        const countryHint = groupTitle.slice(0, 2).toUpperCase();
        const ch = catalog.find((c) => c.xmltvId === best!.xmltvId);
        if (ch?.country === countryHint) {
          best.confidence = Math.min(100, best.confidence + 5);
          best.method = "fuzzy_name_group";
        }
      }
    }
    if (best && best.confidence >= 65) return best;

    if (groupTitle) {
      const countryHint = groupTitle.slice(0, 2).toUpperCase();
      for (const ch of catalog) {
        if (ch.country === countryHint) {
          const score = similarityScore(tvgName, ch.name);
          if (score >= 0.7) {
            return {
              xmltvId: ch.xmltvId,
              confidence: Math.round(score * 90),
              method: "group_name",
            };
          }
        }
      }
    }

    const cleanedName = normalizedName.replace(/\b(tv|channel|de|fr|uk|us)\b/g, "").replace(/\s+/g, " ").trim();
    if (cleanedName && cleanedName !== normalizedName) {
      for (const ch of catalog) {
        const chNorm = normalizeChannelName(ch.name);
        if (chNorm.includes(cleanedName) || cleanedName.includes(chNorm)) {
          return { xmltvId: ch.xmltvId, confidence: 75, method: "cleaned_name" };
        }
      }
    }
  }

  return null;
}
