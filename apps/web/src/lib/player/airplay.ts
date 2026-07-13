/// WebKit AirPlay APIs (Safari / iOS).

interface WebKitPlaybackTargetAvailabilityEvent extends Event {
  availability: "available" | "not-available";
}

interface HTMLVideoElementWithAirPlay extends HTMLVideoElement {
  webkitShowPlaybackTargetPicker?: () => void;
  webkitCurrentPlaybackTargetIsWireless?: boolean;
}

declare global {
  interface Window {
    WebKitPlaybackTargetAvailabilityEvent?: typeof Event;
  }
}

export type { HTMLVideoElementWithAirPlay, WebKitPlaybackTargetAvailabilityEvent };

export function supportsAirPlay(): boolean {
  return (
    typeof window !== "undefined" &&
    "WebKitPlaybackTargetAvailabilityEvent" in window
  );
}

export function configureAirPlayVideo(video: HTMLVideoElement): void {
  video.setAttribute("x-webkit-airplay", "allow");
  video.setAttribute("webkit-airplay", "allow");
  video.disableRemotePlayback = false;
}

export function showAirPlayPicker(video: HTMLVideoElement): void {
  const airplayVideo = video as HTMLVideoElementWithAirPlay;
  airplayVideo.webkitShowPlaybackTargetPicker?.();
}

export function isAirPlayActive(video: HTMLVideoElement): boolean {
  const airplayVideo = video as HTMLVideoElementWithAirPlay;
  return Boolean(airplayVideo.webkitCurrentPlaybackTargetIsWireless);
}
