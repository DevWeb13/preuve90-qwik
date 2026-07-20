import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { PRODUCT_CONFIG } from "~/config/product";
import { SCAN_CONFIG } from "../../scripts/odds/config.mjs";
import { resolveCollectionMode } from "../../scripts/odds/resolve-collection-mode.mjs";

const ODDS_SCHEDULE = "0 0,6,12,18 * * *";
const RESULTS_SCHEDULE = "45 6,18 * * *";

describe("résolution du mode de collecte", () => {
  it.each(["odds", "results", "all"] as const)(
    "retourne le mode manuel %s",
    (manualInputMode) => {
      expect(
        resolveCollectionMode({
          eventName: "workflow_dispatch",
          eventSchedule: "",
          manualInputMode,
        }),
      ).toBe(manualInputMode);
    },
  );

  it("rejette un mode manuel inconnu", () => {
    expect(() =>
      resolveCollectionMode({
        eventName: "workflow_dispatch",
        eventSchedule: "",
        manualInputMode: "unknown",
      }),
    ).toThrow("Mode manuel inconnu");
  });

  it.each([
    [ODDS_SCHEDULE, "odds"],
    [RESULTS_SCHEDULE, "results"],
  ] as const)("résout le cron %s en %s", (eventSchedule, expectedMode) => {
    expect(
      resolveCollectionMode({ eventName: "schedule", eventSchedule, manualInputMode: "all" }),
    ).toBe(expectedMode);
  });

  it("rejette un cron inconnu et ne retourne jamais all pour un cron", () => {
    expect(() =>
      resolveCollectionMode({
        eventName: "schedule",
        eventSchedule: "0 1 * * *",
        manualInputMode: "all",
      }),
    ).toThrow("Planification inconnue");
    for (const eventSchedule of [ODDS_SCHEDULE, RESULTS_SCHEDULE]) {
      expect(
        resolveCollectionMode({ eventName: "schedule", eventSchedule, manualInputMode: "all" }),
      ).not.toBe("all");
    }
  });

  it("rejette un événement GitHub inconnu", () => {
    expect(() =>
      resolveCollectionMode({
        eventName: "push",
        eventSchedule: "",
        manualInputMode: "odds",
      }),
    ).toThrow("Événement GitHub inconnu");
  });

  it("écrit uniquement le mode résolu sur la sortie standard", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/odds/resolve-collection-mode.mjs", "schedule", ODDS_SCHEDULE, ""],
      { encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("odds\n");
    expect(result.stderr).toBe("");
  });

  it("expose la limite de fraîcheur sans l’ajouter à la fenêtre de collecte", () => {
    expect(PRODUCT_CONFIG.maximumSnapshotAgeMinutes).toBe(150);
    expect(SCAN_CONFIG.maximumSnapshotAgeMinutes).toBe(150);
    expect(SCAN_CONFIG.minimumLeadMinutes).toBe(30);
    expect(SCAN_CONFIG.maximumLeadHours).toBe(8);
  });
});

describe("workflow de collecte", () => {
  const workflow = readFileSync(".github/workflows/collect-betting-data.yml", "utf8");

  it("conserve le mode manuel et les deux planifications UTC", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain(`cron: "${ODDS_SCHEDULE}"`);
    expect(workflow).toContain(`cron: "${RESULTS_SCHEDULE}"`);
  });

  it("résout le mode une fois et le réutilise pour la collecte et la publication", () => {
    expect(workflow).toContain("node scripts/odds/resolve-collection-mode.mjs");
    expect(workflow.match(/steps\.collection-mode\.outputs\.mode/g)).toHaveLength(2);
    expect(workflow).toContain('run: node scripts/odds/run-pipeline.mjs --mode "$COLLECTION_MODE"');
  });

  it("pousse uniquement la branche automation-data", () => {
    const pushCommands = workflow.match(/^\s+git push .+$/gm) ?? [];
    expect(pushCommands).toEqual(["          git push origin automation-data"]);
    expect(workflow).not.toMatch(/git push(?:\s+\S+)*\s+master(?:\s|$)/);
  });
});
