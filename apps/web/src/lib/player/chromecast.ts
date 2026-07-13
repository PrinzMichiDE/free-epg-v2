/// <reference types="chromecast-caf-sender" />

import { buildProxyUrl } from "@/lib/player/stream-proxy";
import type { PlaylistPlayerEntry } from "@/lib/playlists";

let sdkPromise: Promise<boolean> | null = null;
let contextInitialized = false;

function getCastContext(): cast.framework.CastContext | null {
  if (typeof window === "undefined" || !window.cast?.framework) return null;
  return window.cast.framework.CastContext.getInstance();
}

export function loadCastSdk(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.cast?.framework) return Promise.resolve(true);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<boolean>((resolve) => {
    const finish = (available: boolean) => resolve(available);

    window.__onGCastApiAvailable = (isAvailable) => {
      finish(isAvailable && Boolean(window.cast?.framework));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-cast-sender="1"]'
    );
    if (existing) {
      if (window.cast?.framework) {
        finish(true);
        return;
      }
      existing.addEventListener("load", () => finish(Boolean(window.cast?.framework)));
      existing.addEventListener("error", () => finish(false));
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
    script.async = true;
    script.dataset.castSender = "1";
    script.onload = () => {
      if (window.cast?.framework) finish(true);
    };
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export function initializeCastContext(): boolean {
  const context = getCastContext();
  if (!context || contextInitialized) return Boolean(context);

  context.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });
  contextInitialized = true;
  return true;
}

export function buildAbsoluteProxyUrl(
  targetUrl: string,
  opts?: { referrer?: string | null; userAgent?: string | null }
): string {
  if (typeof window === "undefined") {
    return buildProxyUrl(targetUrl, opts);
  }
  return new URL(buildProxyUrl(targetUrl, opts), window.location.origin).href;
}

export function getCastState(): cast.framework.CastState | null {
  const context = getCastContext();
  return context?.getCastState() ?? null;
}

export function isCastConnected(): boolean {
  const state = getCastState();
  return (
    state === cast.framework.CastState.CONNECTED ||
    state === cast.framework.CastState.CONNECTING
  );
}

export async function castChannel(channel: PlaylistPlayerEntry): Promise<void> {
  const available = await loadCastSdk();
  if (!available || !initializeCastContext()) {
    throw new Error("Cast SDK unavailable");
  }

  const context = getCastContext();
  if (!context) throw new Error("Cast context unavailable");

  if (context.getCastState() !== cast.framework.CastState.CONNECTED) {
    await context.requestSession();
  }

  const session = context.getCurrentSession();
  if (!session) throw new Error("No cast session");

  const streamUrl = buildAbsoluteProxyUrl(channel.url, {
    referrer: channel.referrer,
    userAgent: channel.userAgent,
  });

  const mediaInfo = new chrome.cast.media.MediaInfo(
    streamUrl,
    "application/x-mpegURL"
  );
  mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaInfo.metadata.title = channel.title;
  if (channel.groupTitle) {
    mediaInfo.metadata.subtitle = channel.groupTitle;
  }

  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  const result = await session.loadMedia(request);
  if (result) {
    throw new Error(`Cast load failed: ${result}`);
  }
}

export function subscribeCastState(
  listener: (state: cast.framework.CastState) => void
): () => void {
  const context = getCastContext();
  if (!context) return () => undefined;

  const handler = (event: cast.framework.CastStateEventData) => {
    listener(event.castState);
  };

  context.addEventListener(
    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
    handler
  );

  listener(context.getCastState());

  return () => {
    context.removeEventListener(
      cast.framework.CastContextEventType.CAST_STATE_CHANGED,
      handler
    );
  };
}

export async function prepareCast(): Promise<boolean> {
  const available = await loadCastSdk();
  if (!available) return false;
  return initializeCastContext();
}
