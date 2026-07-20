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

function readTimeZoneOffset(value: string, timeZone: string): string {
  const match = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(value))
    .find((part) => part.type === "timeZoneName")?.value;

  const parsed = match?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!parsed) return "+0000";
  return `${parsed[1]}${parsed[2]}${parsed[3]}`;
}

/** Formats an instant using wall-clock time in the given IANA timezone. */
export function formatXmltvDateInTimeZone(date: Date, timeZone: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const offset = readTimeZoneOffset(date.toISOString(), timeZone);
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second} ${offset}`;
}

export function localizeXmltvTimestamps(
  doc: XmltvDocument,
  timeZone: string
): XmltvDocument {
  return {
    ...doc,
    programmes: doc.programmes.map((programme) => {
      const start = parseXmltvDateString(programme.start);
      const stop = parseXmltvDateString(programme.stop);
      if (!start || !stop) return programme;
      return {
        ...programme,
        start: formatXmltvDateInTimeZone(start, timeZone),
        stop: formatXmltvDateInTimeZone(stop, timeZone),
      };
    }),
  };
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
