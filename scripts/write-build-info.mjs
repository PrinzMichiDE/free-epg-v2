import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "apps/web/public");
const outFile = path.join(outDir, "build-info.json");

const info = {
  appVersion: process.env.APP_VERSION ?? process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
  gitSha: (process.env.GIT_SHA ?? process.env.NEXT_PUBLIC_GIT_SHA ?? "dev").slice(0, 7),
  epgOutputVersion: Number(process.env.EPG_OUTPUT_VERSION ?? "2"),
  builtAt: new Date().toISOString(),
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(info, null, 2)}\n`, "utf-8");
console.log(`[build-info] wrote ${outFile}`, info);
