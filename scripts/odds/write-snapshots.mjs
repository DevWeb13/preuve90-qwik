import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { BOOKMAKER, COMPETITIONS } from "./config.mjs";

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DECIMAL_ODDS = /^\d+\.\d+$/;
const FORBIDDEN_TEXT = /apiKey=|https:\/\/api\.the-odds-api\.com|authorization/i;

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) throw new Error(`Snapshot invalide : ${message}`);
}

function assertExactKeys(value, keys, pathLabel) {
  assert(isRecord(value), `${pathLabel} doit être un objet.`);
  assert(
    Object.keys(value).sort().join(",") === [...keys].sort().join(","),
    `${pathLabel} contient des champs inattendus.`,
  );
}

function assertTimestamp(value, pathLabel) {
  assert(
    typeof value === "string" && ISO_UTC.test(value),
    `${pathLabel} doit être en UTC ISO 8601.`,
  );
  assert(new Date(value).toISOString() === value, `${pathLabel} est impossible.`);
}

function validateOddsSnapshot(snapshot) {
  assertExactKeys(snapshot, ["schemaVersion", "generatedAt", "bookmaker", "events"], "odds");
  assert(snapshot.schemaVersion === 1, "odds.schemaVersion doit valoir 1.");
  assertTimestamp(snapshot.generatedAt, "odds.generatedAt");
  assertExactKeys(snapshot.bookmaker, ["key", "name"], "odds.bookmaker");
  assert(
    snapshot.bookmaker.key === BOOKMAKER.key && snapshot.bookmaker.name === BOOKMAKER.name,
    "le bookmaker Betclic (FR) est obligatoire.",
  );
  assert(Array.isArray(snapshot.events), "odds.events doit être une liste.");
  const allowedKeys = new Set(COMPETITIONS.map((competition) => competition.key));
  snapshot.events.forEach((event, index) => {
    const label = `odds.events[${index}]`;
    assertExactKeys(
      event,
      [
        "eventId",
        "sportKey",
        "competitionName",
        "homeTeam",
        "awayTeam",
        "kickoffAt",
        "observedAt",
        "odds",
      ],
      label,
    );
    assert(
      typeof event.eventId === "string" && event.eventId !== "",
      `${label}.eventId est requis.`,
    );
    assert(allowedKeys.has(event.sportKey), `${label}.sportKey n’est pas autorisé.`);
    assert(
      typeof event.competitionName === "string" && event.competitionName !== "",
      `${label}.competitionName est requis.`,
    );
    assert(
      typeof event.homeTeam === "string" && event.homeTeam !== "",
      `${label}.homeTeam est requis.`,
    );
    assert(
      typeof event.awayTeam === "string" && event.awayTeam !== "",
      `${label}.awayTeam est requis.`,
    );
    assertTimestamp(event.kickoffAt, `${label}.kickoffAt`);
    assertTimestamp(event.observedAt, `${label}.observedAt`);
    assert(Date.parse(event.observedAt) < Date.parse(event.kickoffAt), `${label} a déjà commencé.`);
    assertExactKeys(event.odds, ["home", "draw", "away"], `${label}.odds`);
    for (const outcome of ["home", "draw", "away"]) {
      assert(
        typeof event.odds[outcome] === "string" && DECIMAL_ODDS.test(event.odds[outcome]),
        `${label}.odds.${outcome} est invalide.`,
      );
    }
  });
}

function validateResultsSnapshot(snapshot) {
  assertExactKeys(snapshot, ["schemaVersion", "generatedAt", "events"], "results");
  assert(snapshot.schemaVersion === 1, "results.schemaVersion doit valoir 1.");
  assertTimestamp(snapshot.generatedAt, "results.generatedAt");
  assert(Array.isArray(snapshot.events), "results.events doit être une liste.");
  snapshot.events.forEach((event, index) => {
    const label = `results.events[${index}]`;
    assertExactKeys(
      event,
      ["eventId", "sportKey", "homeTeam", "awayTeam", "kickoffAt", "completed", "status", "score"],
      label,
    );
    assert(
      typeof event.eventId === "string" && event.eventId !== "",
      `${label}.eventId est requis.`,
    );
    assert(
      typeof event.sportKey === "string" && event.sportKey !== "",
      `${label}.sportKey est requis.`,
    );
    assert(
      typeof event.homeTeam === "string" && event.homeTeam !== "",
      `${label}.homeTeam est requis.`,
    );
    assert(
      typeof event.awayTeam === "string" && event.awayTeam !== "",
      `${label}.awayTeam est requis.`,
    );
    assertTimestamp(event.kickoffAt, `${label}.kickoffAt`);
    assert(
      ["complete", "incomplete", "ambiguous"].includes(event.status),
      `${label}.status est invalide.`,
    );
    if (event.completed) {
      assert(event.status === "complete", `${label} terminé doit avoir le statut complete.`);
      assertExactKeys(event.score, ["home", "away"], `${label}.score`);
      assert(
        Number.isSafeInteger(event.score.home) && event.score.home >= 0,
        `${label}.score.home est invalide.`,
      );
      assert(
        Number.isSafeInteger(event.score.away) && event.score.away >= 0,
        `${label}.score.away est invalide.`,
      );
    } else {
      assert(
        event.score === null,
        `${label} incomplet ou ambigu ne doit pas exposer de score final.`,
      );
    }
  });
}

function validateMetadata(metadata) {
  assertExactKeys(
    metadata,
    [
      "schemaVersion",
      "generatedAt",
      "mode",
      "competitions",
      "requests",
      "eventsReceived",
      "eventsPublished",
      "quota",
    ],
    "metadata",
  );
  assert(metadata.schemaVersion === 1, "metadata.schemaVersion doit valoir 1.");
  assertTimestamp(metadata.generatedAt, "metadata.generatedAt");
  assert(["odds", "results", "all"].includes(metadata.mode), "metadata.mode est invalide.");
  assert(Array.isArray(metadata.competitions), "metadata.competitions doit être une liste.");
  for (const field of ["requests", "eventsReceived", "eventsPublished"]) {
    assert(
      Number.isSafeInteger(metadata[field]) && metadata[field] >= 0,
      `metadata.${field} est invalide.`,
    );
  }
  assertExactKeys(metadata.quota, ["used", "remaining", "lastRequestCost"], "metadata.quota");
  for (const field of ["used", "remaining", "lastRequestCost"]) {
    assert(
      metadata.quota[field] === null ||
        (Number.isSafeInteger(metadata.quota[field]) && metadata.quota[field] >= 0),
      `metadata.quota.${field} est invalide.`,
    );
  }
}

export function validateSnapshotSet(snapshotSet) {
  validateOddsSnapshot(snapshotSet.odds);
  validateResultsSnapshot(snapshotSet.results);
  validateMetadata(snapshotSet.metadata);
  const serialized = JSON.stringify(snapshotSet);
  assert(!FORBIDDEN_TEXT.test(serialized), "une URL ou information sensible a été détectée.");
  return snapshotSet;
}

async function writeJsonAtomically(filepath, value) {
  const temporaryPath = `${filepath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryPath, filepath);
}

export async function writeSnapshotSet(outputDirectory, snapshotSet) {
  validateSnapshotSet(snapshotSet);
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeJsonAtomically(path.join(outputDirectory, "odds.json"), snapshotSet.odds),
    writeJsonAtomically(path.join(outputDirectory, "results.json"), snapshotSet.results),
    writeJsonAtomically(path.join(outputDirectory, "metadata.json"), snapshotSet.metadata),
  ]);
}

export async function readSnapshotSet(outputDirectory) {
  const [odds, results, metadata] = await Promise.all(
    ["odds.json", "results.json", "metadata.json"].map(async (filename) =>
      JSON.parse(await readFile(path.join(outputDirectory, filename), "utf8")),
    ),
  );
  return { odds, results, metadata };
}
