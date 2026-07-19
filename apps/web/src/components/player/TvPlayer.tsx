"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, PictureInPicture2, RotateCcw } from "lucide-react";
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
  retryLabel: string;
  pipLabel: string;
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

export function TvPlayer(props: TvPlayerProps) {
  return <TvPlayerInner key={props.channel?.id ?? "none"} {...props} />;
}

function TvPlayerInner({
  channel,
  className,
  onError,
  errorLabel,
  loadingLabel,
  retryLabel,
  pipLabel,
}: TvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(() => Boolean(channel?.url));
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const pipSupported =
    typeof document !== "undefined" &&
    "pictureInPictureEnabled" in document &&
    document.pictureInPictureEnabled;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;
    resetVideoElement(video);
    configureAirPlayVideo(video);
    setError(null);
    setLoading(Boolean(channel?.url));

    if (!channel?.url) {
      return;
    }

    const proxyUrl = buildProxyUrl(channel.url, {
      referrer: channel.referrer,
      userAgent: channel.userAgent,
    });

    let cancelled = false;
    let networkRetries = 0;
    let mediaRetries = 0;

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

              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (networkRetries < 2) {
                    networkRetries += 1;
                    hls.startLoad();
                    return;
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  if (mediaRetries < 2) {
                    mediaRetries += 1;
                    hls.recoverMediaError();
                    return;
                  }
                  break;
                default:
                  break;
              }

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
  }, [channel, errorLabel, onError, reloadToken]);

  const enterPictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !pipSupported) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // user dismissed or browser blocked PiP
    }
  };

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

      {channel && !loading && !error && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-8">
          <p className="text-sm font-semibold text-white truncate">{channel.title}</p>
          {channel.groupTitle && (
            <p className="text-xs text-white/70 truncate mt-0.5">{channel.groupTitle}</p>
          )}
        </div>
      )}

      <div className="absolute bottom-12 right-2 z-10 flex items-center gap-1.5">
        {pipSupported && channel && !error && (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
            aria-label={pipLabel}
            title={pipLabel}
            onClick={() => void enterPictureInPicture()}
          >
            <PictureInPicture2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" aria-hidden />
          <span className="sr-only">{loadingLabel}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/80 px-4 py-3 text-sm text-white">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{error}</span>
          </div>
          {channel && (
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25 transition-colors"
              onClick={() => {
                setError(null);
                setLoading(true);
                setReloadToken((value) => value + 1);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {retryLabel}
            </button>
          )}
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
