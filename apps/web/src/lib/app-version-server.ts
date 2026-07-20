import { readFile } from "node:fs/promises";
import path from "node:path";
import { EPG_OUTPUT_VERSION } from "@freeepg/epg-core";

export interface BuildInfo {
  appVersion: string;
  gitSha: string;
  epgOutputVersion: number;
  builtAt?: string;
}

const DEFAULT_BUILD_INFO: BuildInfo = {
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
  gitSha: (process.env.NEXT_PUBLIC_GIT_SHA ?? "dev").slice(0, 7),
  epgOutputVersion: EPG_OUTPUT_VERSION,
};

function buildInfoPaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "apps/web/public/build-info.json"),
    path.join(cwd, "public/build-info.json"),
  ];
}

export async function readBuildInfo(): Promise<BuildInfo> {
  for (const filePath of buildInfoPaths()) {
    try {
      const raw = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw) as BuildInfo;
      if (parsed.appVersion && parsed.gitSha) {
        return {
          appVersion: parsed.appVersion,
          gitSha: parsed.gitSha.slice(0, 7),
          epgOutputVersion: parsed.epgOutputVersion ?? EPG_OUTPUT_VERSION,
          builtAt: parsed.builtAt,
        };
      }
    } catch {
      // try next path
    }
  }

  return DEFAULT_BUILD_INFO;
}

export async function getServerAppVersionLabel(): Promise<string> {
  const info = await readBuildInfo();
  return `v${info.appVersion} · EPG/${info.epgOutputVersion} · ${info.gitSha}`;
}
