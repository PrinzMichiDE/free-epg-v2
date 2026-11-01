"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Maximize, Minimize, PictureInPicture2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildProxyUrl } from "@/lib/player/stream-proxy";
import { IPTV_HLS_CONFIG } from "@/lib/player/hls-config";
import { configureAirPlayVideo } from "@/lib/player/airplay";
import type { PlaylistPlayerEntry } from "@/lib/playlists";
import type Hls from "hls.js";
import { RemotePlaybackControls } from "@/components/player/RemotePlaybackControls";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { ChannelEpgProgramme } from "@/lib/player/channel-epg";

interface TvPlayerProps {
  channel: PlaylistPlayerEntry | null;
  className?: string;
  onError?: (message: string) => void;
  errorLabel: string;
  loadingLabel: string;
  retryLabel: string;
  pipLabel: string;
  fullscreenLabel?: string;
  exitFullscreenLabel?: string;
  nowPlayingLabel?: string;
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
  fullscreenLabel,
  exitFullscreenLabel,
  nowPlayingLabel,
}: TvPlayerProps) {
  const { locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(() => Boolean(channel?.url));
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentProgramme, setCurrentProgramme] = useState<ChannelEpgProgramme | null>(null);
  const [programmeProgress, setProgrammeProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const pipSupported =
    typeof document !== "undefined" &&
    "pictureInPictureEnabled" in document &&
    document.pictureInPictureEnabled;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = muted ? 0 : volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (!channel) return;
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        void toggleFullscreen();
      } else if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        setMuted((m) => !m);
      } else if (event.key === " ") {
        event.preventDefault();
        const video = videoRef.current;
        if (video) {
          if (video.paused) {
            void video.play();
          } else {
            video.pause();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [channel]);

  useEffect(() => {
    if (!channel?.tvgId) {
      setCurrentProgramme(null);
      setProgrammeProgress(0);
      return;
    }
    let cancelled = false;
    const fetchEpg = async () => {
      try {
        const res = await fetch(`/api/channels/${encodeURIComponent(channel.tvgId)}`);
        if (!res.ok) throw new Error("epg failed");
        const data = await res.json();
        if (!cancelled && data.current) {
          setCurrentProgramme(data.current);
        } else if (!cancelled) {
          setCurrentProgramme(null);
        }
      } catch {
        if (!cancelled) setCurrentProgramme(null);
      }
    };
    void fetchEpg();
    const interval = setInterval(fetchEpg, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [channel?.tvgId]);

  useEffect(() => {
    if (!currentProgramme) {
      setProgrammeProgress(0);
      return;
    }
    const updateProgress = () => {
      const now = Date.now();
      const start = new Date(currentProgramme.start).getTime();
      const stop = new Date(currentProgramme.stop).getTime();
      if (stop <= start) {
        setProgrammeProgress(0);
        return;
      }
      const progress = Math.min(100, Math.max(0, ((now - start) / (stop - start)) * 100));
      setProgrammeProgress(progress);
    };
    updateProgress();
    const interval = setInterval(updateProgress, 10000);
    return () => clearInterval(interval);
  }, [currentProgramme]);

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

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const formatTime = (iso: string) => {
    return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : locale, { timeStyle: "short" }).format(
      new Date(iso)
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-sm bg-black group",
        isFullscreen && "aspect-auto h-screen",
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
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 pt-3 pb-12">
          <p className="text-sm sm:text-base font-semibold text-white truncate">{channel.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {channel.groupTitle && (
              <p className="text-xs text-white/70 truncate">{channel.groupTitle}</p>
            )}
            {currentProgramme && (
              <>
                <span className="text-white/40">•</span>
                <p className="text-xs text-white/90 truncate flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
                  <span className="font-medium">{nowPlayingLabel || "Now playing"}:</span> {currentProgramme.title}
                  <span className="text-white/70">({formatTime(currentProgramme.start)}–{formatTime(currentProgramme.stop)})</span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {currentProgramme && !loading && !error && !isFullscreen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 px-4">
          <div className="max-w-md rounded-sm bg-black/70 backdrop-blur-sm px-3 py-2">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span className="font-medium">{currentProgramme.title}</span>
              <span className="tabular-nums">{formatTime(currentProgramme.start)}–{formatTime(currentProgramme.stop)}</span>
            </div>
            <div className="h-1 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-1000"
                style={{ width: `${programmeProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-12 right-2 z-10 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {channel && !error && (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 active:bg-black/85"
            aria-label={muted ? (pipLabel ? "Unmute" : "Unmute") : "Mute"}
            title={muted ? "Unmute (M)" : "Mute (M)"}
            onClick={() => setMuted((m) => !m)}
          >
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
          </button>
        )}
        {channel && !error && (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 active:bg-black/85"
            aria-label={isFullscreen ? (exitFullscreenLabel || "Exit fullscreen") : (fullscreenLabel || "Fullscreen")}
            title={isFullscreen ? (exitFullscreenLabel || "Exit fullscreen") : (fullscreenLabel || "Fullscreen")}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" aria-hidden /> : <Maximize className="h-4 w-4" aria-hidden />}
          </button>
        )}
        {pipSupported && channel && !error && (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 active:bg-black/85"
            aria-label={pipLabel}
            title={pipLabel}
            onClick={() => void enterPictureInPicture()}
          >
            <PictureInPicture2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-white" aria-hidden />
            <span className="text-sm text-white/90">{loadingLabel}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/90 px-4 py-3 text-sm text-white">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden />
            <span className="truncate">{error}</span>
          </div>
          {channel && (
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25 transition-colors"
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
