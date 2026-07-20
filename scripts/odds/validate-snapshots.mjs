#!/usr/bin/env node

import path from "node:path";
import { readSnapshotSet, validateSnapshotSet } from "./write-snapshots.mjs";

function outputDirectory(argv) {
  const outputIndex = argv.indexOf("--output");
  if (outputIndex === -1) return path.join(process.cwd(), "tmp/snapshots");
  if (!argv[outputIndex + 1]) throw new Error("La valeur de --output est requise.");
  return path.resolve(argv[outputIndex + 1]);
}

try {
  const snapshots = await readSnapshotSet(outputDirectory(process.argv.slice(2)));
  validateSnapshotSet(snapshots);
  console.log("Snapshots The Odds API valides.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Snapshots The Odds API invalides.");
  process.exitCode = 1;
}
