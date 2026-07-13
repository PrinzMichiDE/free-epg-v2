"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Airplay, Cast, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  configureAirPlayVideo,
  isAirPlayActive,
  showAirPlayPicker,
  supportsAirPlay,
  type WebKitPlaybackTargetAvailabilityEvent,
} from "@/lib/player/airplay";
import {
  castChannel,
  isCastConnected,
  prepareCast,
  subscribeCastState,
} from "@/lib/player/chromecast";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistPlayerEntry } from "@/lib/playlists";

interface RemotePlaybackControlsProps {
  channel: PlaylistPlayerEntry | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCastError?: (message: string) => void;
}

const controlButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 disabled:opacity-40 disabled:pointer-events-none";

export function RemotePlaybackControls({
  channel,
  videoRef,
  onCastError,
}: RemotePlaybackControlsProps) {
  const { t } = useI18n();
  const [castReady, setCastReady] = useState(false);
  const [castConnected, setCastConnected] = useState(false);
  const [castLoading, setCastLoading] = useState(false);
  const [airPlayAvailable, setAirPlayAvailable] = useState(false);
  const [airPlayActive, setAirPlayActive] = useState(false);
  const lastCastChannelIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void prepareCast().then((ready) => {
      if (!cancelled) setCastReady(ready);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!castReady) return;
    return subscribeCastState((state) => {
      setCastConnected(
        state === cast.framework.CastState.CONNECTED ||
          state === cast.framework.CastState.CONNECTING
      );
    });
  }, [castReady]);

  useEffect(() => {
    if (!castConnected) {
      lastCastChannelIdRef.current = null;
    }
  }, [castConnected]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !supportsAirPlay()) return;

    configureAirPlayVideo(video);

    const onAvailability = (event: Event) => {
      const availability = (event as WebKitPlaybackTargetAvailabilityEvent)
        .availability;
      setAirPlayAvailable(availability === "available");
    };

    const onTargetChange = () => {
      setAirPlayActive(isAirPlayActive(video));
    };

    video.addEventListener("webkitplaybacktargetavailabilitychanged", onAvailability);
    video.addEventListener("webkitcurrentplaybacktargetiswirelesschanged", onTargetChange);
    setAirPlayActive(isAirPlayActive(video));

    return () => {
      video.removeEventListener(
        "webkitplaybacktargetavailabilitychanged",
        onAvailability
      );
      video.removeEventListener(
        "webkitcurrentplaybacktargetiswirelesschanged",
        onTargetChange
      );
    };
  }, [videoRef, channel?.id]);

  const sendToCast = useCallback(async () => {
    if (!channel || castLoading) return;

    setCastLoading(true);
    try {
      await castChannel(channel);
      lastCastChannelIdRef.current = channel.id;
      videoRef.current?.pause();
    } catch {
      onCastError?.(t("player.cast.error"));
    } finally {
      setCastLoading(false);
    }
  }, [channel, castLoading, onCastError, t, videoRef]);

  useEffect(() => {
    if (!channel || !castConnected || castLoading || !isCastConnected()) return;
    if (lastCastChannelIdRef.current === channel.id) return;

    lastCastChannelIdRef.current = channel.id;
    void castChannel(channel).catch(() => {
      onCastError?.(t("player.cast.error"));
    });
  }, [channel, castConnected, castLoading, onCastError, t]);

  const showCast = castReady;
  const showAirPlay = airPlayAvailable;

  if (!showCast && !showAirPlay) return null;

  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
      {showAirPlay && (
        <button
          type="button"
          className={cn(
            controlButtonClass,
            airPlayActive && "ring-2 ring-[var(--accent)] text-[var(--accent)]"
          )}
          aria-label={t("player.airplay.label")}
          title={t("player.airplay.connect")}
          onClick={() => {
            const video = videoRef.current;
            if (video) showAirPlayPicker(video);
          }}
        >
          <Airplay className="h-4 w-4" aria-hidden />
        </button>
      )}

      {showCast && (
        <button
          type="button"
          className={cn(
            controlButtonClass,
            castConnected && "ring-2 ring-[var(--accent)] text-[var(--accent)]"
          )}
          aria-label={t("player.cast.label")}
          title={
            castConnected ? t("player.cast.connected") : t("player.cast.connect")
          }
          disabled={!channel || castLoading}
          onClick={() => void sendToCast()}
        >
          {castLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Cast className="h-4 w-4" aria-hidden />
          )}
        </button>
      )}
    </div>
  );
}
