"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildProxyUrl } from "@/lib/player/stream-proxy";
import { IPTV_HLS_CONFIG } from "@/lib/player/hls-config";
import { configureAirPlayVideo } from "@/lib/player/airplay";
import type { PlaylistPlayerEntry } from "@/lib/playlists";
import type Hls from "hls.js";
import { RemotePlaybackControls } from "@/components/player/RemotePlaybackControls";

interface TvPlayerProps {
  channel: PlaylistPlayerEntry | null;
  className?: string;
  onError?: (message: string) => void;
  errorLabel: string;
  loadingLabel: string;
}

function isHlsUrl(url: string): boolean {
  return (
    url.includes(".m3u8") ||
    url.includes("m3u8?") ||
    !url.match(/\.(mp4|webm|ogg)(\?|$)/i)
  );
}

function resetVideoElement(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute("src");
  video.load();
}

export function TvPlayer({
  channel,
  className,
  onError,
  errorLabel,
  loadingLabel,
}: TvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;
    resetVideoElement(video);
    configureAirPlayVideo(video);
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

    const playWhenReady = () => {
      const onCanPlay = () => {
        video.removeEventListener("canplay", onCanPlay);
        if (cancelled) return;
        video
          .play()
          .then(() => {
            if (!cancelled) setLoading(false);
          })
          .catch(() => fail(errorLabel));
      };
      video.addEventListener("canplay", onCanPlay);
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        onCanPlay();
      }
    };

    const playDirect = () => {
      video.src = proxyUrl;
      playWhenReady();
    };

    const setup = async () => {
      const isHls = isHlsUrl(channel.url);

      if (
        isHls &&
        !video.canPlayType("application/vnd.apple.mpegurl") &&
        !video.canPlayType("application/x-mpegURL")
      ) {
        try {
          const { default: Hls } = await import("hls.js");
          if (cancelled) return;

          if (Hls.isSupported()) {
            const hls = new Hls(IPTV_HLS_CONFIG);
            hlsRef.current = hls;
            hls.attachMedia(video);
            hls.loadSource(proxyUrl);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (cancelled) return;
              playWhenReady();
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
      resetVideoElement(video);
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
        disableRemotePlayback={false}
      />

      {channel && (
        <RemotePlaybackControls
          channel={channel}
          videoRef={videoRef}
          onCastError={(message) => {
            setError(message);
            onError?.(message);
          }}
        />
      )}

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
