import { parseXmltvDateString } from "@freeepg/epg-core";

export const PROGRAMME_PREVIEW_CLEANUP = "replace-all-for-country-channels" as const;

export interface PreviewProgrammeInput {
  channel: string;
  start: string;
  stop: string;
  title: string;
  desc?: string;
  category?: string;
}

export interface ProgrammePreviewRow {
  channelId: number;
  start: Date;
  stop: Date;
  title: string;
  description: string | null;
  category: string | null;
  source: string;
}

export function getProgrammePreviewCleanupStrategy(): typeof PROGRAMME_PREVIEW_CLEANUP {
  return PROGRAMME_PREVIEW_CLEANUP;
}

export function buildProgrammePreviewBatch(
  programmes: PreviewProgrammeInput[],
  chMap: Map<string, number>,
  now: Date,
  horizonHours = 24
): ProgrammePreviewRow[] {
  const horizon = new Date(now.getTime() + horizonHours * 60 * 60 * 1000);
  const batch: ProgrammePreviewRow[] = [];

  for (const prog of programmes) {
    const channelId = chMap.get(prog.channel);
    if (!channelId) continue;

    const start = parseXmltvDateString(prog.start);
    const stop = parseXmltvDateString(prog.stop);
    if (!start || !stop || start > horizon) continue;

    batch.push({
      channelId,
      start,
      stop,
      title: prog.title,
      description: prog.desc ?? null,
      category: prog.category ?? null,
      source: "merged",
    });
  }

  return batch;
}
