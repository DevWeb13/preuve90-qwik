#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const MANUAL_MODES = new Set(["odds", "results", "all"]);
const SCHEDULE_MODES = new Map([
  ["0 0,6,12,18 * * *", "odds"],
  ["45 6,18 * * *", "results"],
]);

export function resolveCollectionMode({ eventName, eventSchedule, manualInputMode }) {
  if (eventName === "workflow_dispatch") {
    if (!MANUAL_MODES.has(manualInputMode)) {
      throw new Error(`Mode manuel inconnu : ${manualInputMode || "<vide>"}.`);
    }
    return manualInputMode;
  }

  if (eventName === "schedule") {
    const mode = SCHEDULE_MODES.get(eventSchedule);
    if (!mode) {
      throw new Error(`Planification inconnue : ${eventSchedule || "<vide>"}.`);
    }
    return mode;
  }

  throw new Error(`Événement GitHub inconnu : ${eventName || "<vide>"}.`);
}

function runCli() {
  const [eventName, eventSchedule, manualInputMode] = process.argv.slice(2);
  const mode = resolveCollectionMode({ eventName, eventSchedule, manualInputMode });
  process.stdout.write(`${mode}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Impossible de résoudre le mode.");
    process.exitCode = 1;
  }
}
