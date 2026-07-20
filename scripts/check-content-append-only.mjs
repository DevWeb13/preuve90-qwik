#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const CONTENT_DIRECTORIES = ["src/content/predictions", "src/content/settlements"];
const baseRef = process.argv[2] || process.env.CONTENT_BASE_REF || "origin/master";

function runGit(args) {
  return spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function isProtectedJson(path) {
  return CONTENT_DIRECTORIES.some(
    (directory) => path.startsWith(`${directory}/`) && path.endsWith(".json"),
  );
}

function operationLabel(status) {
  if (status.startsWith("R")) return "renommage";
  if (status === "M") return "modification";
  if (status === "D") return "suppression";
  return `opération ${status}`;
}

const baseCheck = runGit(["rev-parse", "--verify", `${baseRef}^{commit}`]);
if (baseCheck.status !== 0) {
  console.error(`Référence de base introuvable : ${baseRef}`);
  process.exit(2);
}

const diff = runGit([
  "-c",
  "core.quotepath=false",
  "diff",
  "--name-status",
  "--find-renames",
  baseRef,
  "--",
  ...CONTENT_DIRECTORIES,
]);

if (diff.status !== 0) {
  console.error(`Impossible de comparer les preuves avec ${baseRef}.`);
  process.exit(2);
}

const violations = [];

for (const line of diff.stdout.split("\n")) {
  if (!line) continue;
  const [status, ...paths] = line.split("\t");
  const protectedPaths = paths.filter(isProtectedJson);

  if (protectedPaths.length === 0 || status === "A") continue;

  violations.push({ status, paths: protectedPaths });
}

if (violations.length > 0) {
  console.error("Intégrité append-only refusée :");
  for (const violation of violations) {
    console.error(`- ${operationLabel(violation.status)} : ${violation.paths.join(" -> ")}`);
  }
  process.exit(1);
}

console.log(`Intégrité append-only vérifiée par rapport à ${baseRef}.`);
