import type { XmltvDocument } from "./matcher.js";

/** epg.pw encodes Asia/Shanghai wall-clock values but labels them as UTC (+0000). */
export const EPG_PW_FALSE_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

export function parseXmltvDateString(value: string): Date | null {
  const match = value
    .trim()
    .match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-])(\d{2})(\d{2}))?$/);
  if (!match) return null;

  const [, y, mo, d, h, mi, s, sign, tzh, tzm] = match;
  const utcMs = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);

  if (sign && tzh !== undefined && tzm !== undefined) {
    const offsetMinutes =
      (sign === "+" ? 1 : -1) * (parseInt(tzh, 10) * 60 + parseInt(tzm, 10));
    return new Date(utcMs - offsetMinutes * 60 * 1000);
  }

  return new Date(utcMs);
}

export function formatXmltvDateUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${d}${h}${mi}${s} +0000`;
}

/**
 * Corrects epg.pw programme timestamps (see GitHub issue #1).
 * Their +0000 suffix is wrong: values are UTC+8 wall times, not real UTC.
 */
export function correctEpgPwTimestamp(value: string): string {
  const parsed = parseXmltvDateString(value);
  if (!parsed) return value;
  return formatXmltvDateUtc(new Date(parsed.getTime() - EPG_PW_FALSE_UTC_OFFSET_MS));
}

export function normalizeEpgPwDocument(doc: XmltvDocument): XmltvDocument {
  return {
    ...doc,
    programmes: doc.programmes.map((programme) => ({
      ...programme,
      start: correctEpgPwTimestamp(programme.start),
      stop: correctEpgPwTimestamp(programme.stop),
    })),
  };
}
