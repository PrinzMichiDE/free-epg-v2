import type { HlsConfig } from "hls.js";

/**
 * HLS.js settings for standard live IPTV (MPEG-TS in HLS).
 * lowLatencyMode is off — LL-HLS targets cause A/V drift on typical IPTV feeds.
 */
export const IPTV_HLS_CONFIG: Partial<HlsConfig> = {
  enableWorker: true,
  lowLatencyMode: false,
  liveSyncDurationCount: 3,
  liveMaxLatencyDurationCount: 10,
  maxLiveSyncPlaybackRate: 1,
  liveSyncMode: "buffered",
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  backBufferLength: 30,
  maxAudioFramesDrift: 4,
  stretchShortVideoTrack: true,
  startOnSegmentBoundary: true,
};
