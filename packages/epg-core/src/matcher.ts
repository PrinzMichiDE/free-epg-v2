export interface XmltvChannel {
  id: string;
  displayName: string;
  icon?: string;
}

export interface ChannelRecord {
  lineNumber: number;
  tvgName?: string;
  tvgId?: string;
  tvgLogo?: string;
  groupTitle?: string;
  displayName?: string;
  streamUrl: string;
  rawExtinf: string;
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

/**
 * Matches a parsed M3U channel record against an XmltvChannel.
 * Returns a similarity score in the range 0–100 (100 = perfect match).
 */
export function matchChannel(
  channel: ChannelRecord,
  xmltv: XmltvChannel,
): number {
  let bestScore = 0;

  // Collect all name-like fields from the M3U record.
  const names: string[] = [];
  if (channel.displayName) names.push(channel.displayName);
  if (channel.tvgName) names.push(channel.tvgName);

  const xmltvName = xmltv.displayName;
  if (typeof xmltvName === "string") {
    for (const name of names) {
      const score = similarityScore(name, xmltvName);
      if (score > bestScore) bestScore = score;
    }
  }

  return bestScore;
}

/**
 * LRU-Cache (Least Recently Used) ohne externe Dependencies.
 * Einfache Map-basierte Implementierung mit konfigurierter Maximalgröße.
 */
export class LRUCache<K, V> {
  private readonly max: number;
  private readonly cache = new Map<K, V>();

  constructor(maxSize: number) {
    this.max = Math.max(1, maxSize);
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;
    // Refresh: remove and re-insert to mark as most recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      // Evict least recently used (first entry in Map insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  get size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Globale Instance mit 8192 Einträgen für normalizeChannelName
const normalizeCache = new LRUCache<string, string>(8192);

export function normalizeXmltvId(id: string): string {
  return id.trim().replace(/[_\s]+/g, ".").replace(/\.+/g, ".");
}

export function normalizeChannelName(name: string): string {
  const cached = normalizeCache.get(name);
  if (cached !== undefined) return cached;

  const result = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  normalizeCache.set(name, result);
  return result;
}

export function similarityScore(a: string, b: string): number {
  const na = normalizeChannelName(a);
  const nb = normalizeChannelName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const setA = new Set(na.split(" "));
  const setB = new Set(nb.split(" "));
  const intersection = [...setA].filter((x) => setB.has(x));
  const unionSize = new Set([...setA, ...setB]).size;
  if (unionSize === 0) return 0;

  return intersection.length / unionSize;
}