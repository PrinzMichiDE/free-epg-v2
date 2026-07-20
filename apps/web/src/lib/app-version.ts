import { EPG_OUTPUT_VERSION } from "@freeepg/epg-core";

const DEFAULT_APP_VERSION = "0.1.0";

export interface AppVersionInfo {
  appVersion: string;
  epgOutputVersion: number;
  gitSha: string;
  label: string;
}

export function getAppVersionInfo(): AppVersionInfo {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? DEFAULT_APP_VERSION;
  const gitSha = (process.env.NEXT_PUBLIC_GIT_SHA ?? "dev").slice(0, 7);
  const epgOutputVersion = EPG_OUTPUT_VERSION;

  return {
    appVersion,
    epgOutputVersion,
    gitSha,
    label: `v${appVersion} · EPG/${epgOutputVersion} · ${gitSha}`,
  };
}
