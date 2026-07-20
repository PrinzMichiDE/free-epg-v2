import type { XmltvChannel, XmltvDocument, XmltvProgramme } from "@freeepg/epg-core";

/**
 * Maps iptv-org style channel ids to source ids that carry the same schedule.
 * The first source id with programmes wins.
 */
export const CHANNEL_PROGRAMME_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "NDRFernsehen.de": ["NDR.de", "76748", "NDRFernsehenNiedersachsen.de"],
  "NDRFernsehenInternational.de": ["NDR.de", "76748"],
  "NDRFernsehenNiedersachsen.de": ["NDR.de", "76748"],
  "NDRFernsehenHamburg.de": ["NDRHamburg.de", "NDR.de", "76748"],
  "NDRFernsehenSchleswig-Holstein.de": [
    "NDRSchleswig-Holstein.de",
    "NDR.de",
    "76748",
  ],
  "NDRFernsehenMecklenburg-Vorpommern.de": [
    "NDRMecklenburg-Vorpommern.de",
    "NDR.de",
    "76748",
  ],
  /** epg.pw uses numeric id 76748; iptv-epg uses NDR.de */
  "NDR.de": ["76748"],
};

const channelById = (channels: XmltvChannel[]): Map<string, XmltvChannel> =>
  new Map(channels.map((channel) => [channel.id, channel]));

function resolveAliasSource(
  programmes: XmltvProgramme[],
  sourceIds: readonly string[]
): string | null {
  for (const sourceId of sourceIds) {
    if (programmes.some((programme) => programme.channel === sourceId)) {
      return sourceId;
    }
  }
  return null;
}

/**
 * Copies programmes (and channel metadata when missing) to iptv-org ids used in playlists.
 */
export function applyChannelAliases(doc: XmltvDocument): XmltvDocument {
  const channels = [...doc.channels];
  const channelMap = channelById(channels);
  const programmes = [...doc.programmes];

  for (const [targetId, sourceIds] of Object.entries(CHANNEL_PROGRAMME_ALIASES)) {
    if (programmes.some((programme) => programme.channel === targetId)) {
      continue;
    }

    const sourceId = resolveAliasSource(programmes, sourceIds);
    if (!sourceId) continue;

    const sourceChannel = channelMap.get(sourceId);
    if (!channelMap.has(targetId)) {
      channels.push({
        id: targetId,
        displayName: sourceChannel?.displayName ?? targetId,
        icon: sourceChannel?.icon,
      });
      channelMap.set(targetId, channels[channels.length - 1]!);
    }

    for (const programme of programmes) {
      if (programme.channel !== sourceId) continue;
      programmes.push({
        ...programme,
        channel: targetId,
      });
    }
  }

  return { channels, programmes };
}
