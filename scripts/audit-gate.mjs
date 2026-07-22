#!/usr/bin/env node
/**
 * Fails CI when high/critical npm advisories affect direct dependencies of
 * @freeepg workspace packages (excluding framework stacks tracked separately).
 */
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FRAMEWORK_DEPS = new Set(["next", "next-auth", "react", "react-dom", "eslint-config-next"]);

function workspaceManifestPaths() {
  const paths = [];
  for (const scope of ["apps", "packages"]) {
    const base = join(root, scope);
    for (const entry of readdirSync(base)) {
      const manifest = join(base, entry, "package.json");
      if (statSync(join(base, entry)).isDirectory()) {
        try {
          readFileSync(manifest);
          paths.push(manifest);
        } catch {
          // skip
        }
      }
    }
  }
  return paths;
}

const gatedDeps = new Set();
for (const manifestPath of workspaceManifestPaths()) {
  const pkg = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const section of ["dependencies", "devDependencies"]) {
    for (const name of Object.keys(pkg[section] ?? {})) {
      if (!FRAMEWORK_DEPS.has(name)) gatedDeps.add(name);
    }
  }
}

let stdout = "";
try {
  stdout = execSync("npm audit --json", { cwd: root, encoding: "utf8" });
} catch (error) {
  stdout = error.stdout?.toString() ?? "";
  if (!stdout) throw error;
}

const report = JSON.parse(stdout);
const advisories = Object.values(report.vulnerabilities ?? {});

const blocking = advisories.filter((entry) => {
  const severity = entry.severity;
  if (severity !== "high" && severity !== "critical") return false;
  if (!gatedDeps.has(entry.name)) return false;
  return entry.isDirect || entry.name === "fast-xml-parser";
});

if (blocking.length > 0) {
  console.error("Blocking security advisories in gated workspace dependencies:");
  for (const item of blocking) {
    console.error(`- ${item.name} (${item.severity})`);
  }
  process.exit(1);
}

console.log(
  `Audit gate passed (${advisories.length} total advisories; gated deps clean).`
);
