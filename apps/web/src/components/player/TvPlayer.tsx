"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildProxyUrl } from "@/lib/player/stream-proxy";
import type { PlaylistPlayerEntry } from "@/lib/playlists";

interface TvPlayerProps {
  channel: PlaylistPlayerEntry | null;
  className?: string;
  onError?: (message: string) => void;
  errorLabel: string;
  loadingLabel: string;
}

export function TvPlayer({
  channel,
  className,
  onError,
  errorLabel,
  loadingLabel,
}: TvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;
    video.removeAttribute("src");
    video.load();
    setError(null);

    if (!channel?.url) {
      setLoading(false);
      return;
    }

    const proxyUrl = buildProxyUrl(channel.url, {
      referrer: channel.referrer,
      userAgent: channel.userAgent,
    });

    let cancelled = false;
    setLoading(true);

    const fail = (message: string) => {
      if (cancelled) return;
      setLoading(false);
      setError(message);
      onError?.(message);
    };

    const playDirect = () => {
      video.src = proxyUrl;
      video
        .play()
        .then(() => {
          if (!cancelled) setLoading(false);
        })
        .catch(() => fail(errorLabel));
    };

    const setup = async () => {
      const isHls =
        channel.url.includes(".m3u8") ||
        channel.url.includes("m3u8?") ||
        !channel.url.match(/\.(mp4|webm|ogg)(\?|$)/i);

      if (
        isHls &&
        !video.canPlayType("application/vnd.apple.mpegurl") &&
        !video.canPlayType("application/x-mpegURL")
      ) {
        try {
          const { default: Hls } = await import("hls.js");
          if (cancelled) return;

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hlsRef.current = hls;
            hls.loadSource(proxyUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (cancelled) return;
              video.play().catch(() => fail(errorLabel));
              setLoading(false);
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (cancelled || !data.fatal) return;
              fail(errorLabel);
            });
            return;
          }
        } catch {
          fail(errorLabel);
          return;
        }
      }

      playDirect();
    };

    void setup();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [channel, errorLabel, onError]);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        className
      )}
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-contain"
        controls
        playsInline
        autoPlay
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" aria-hidden />
          <span className="sr-only">{loadingLabel}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/75 px-4 py-3 text-sm text-white">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      {!channel && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
          —
        </div>
      )}
    </div>
  );
}
