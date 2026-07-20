import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { BOOKMAKER, ODDS_QUERY, SCAN_CONFIG } from "./config.mjs";

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

function assertNonEmptyString(value, pathLabel) {
  assert(typeof value === "string" && value.trim() !== "", `${pathLabel} est requis.`);
}

function assertTimestamp(value, pathLabel) {
  assert(
    typeof value === "string" && ISO_UTC.test(value),
    `${pathLabel} doit être en UTC ISO 8601.`,
  );
  assert(new Date(value).toISOString() === value, `${pathLabel} est impossible.`);
}

function assertWindow(window, pathLabel) {
  assertExactKeys(window, ["minimumLeadMinutes", "maximumLeadHours"], pathLabel);
  assert(
    window.minimumLeadMinutes === SCAN_CONFIG.minimumLeadMinutes,
    `${pathLabel}.minimumLeadMinutes est invalide.`,
  );
  assert(
    window.maximumLeadHours === SCAN_CONFIG.maximumLeadHours,
    `${pathLabel}.maximumLeadHours est invalide.`,
  );
}

function assertSortedEvents(events, pathLabel) {
  const keys = events.map((event) => `${event.startsAt}\0${event.eventId}`);
  assert(
    keys.join("\n") === [...keys].sort().join("\n"),
    `${pathLabel} doit être trié par startsAt puis eventId.`,
  );
}

function validateOddsSnapshot(snapshot) {
  assertExactKeys(
    snapshot,
    ["schemaVersion", "generatedAt", "bookmaker", "window", "events"],
    "odds",
  );
  assert(snapshot.schemaVersion === 2, "odds.schemaVersion doit valoir 2.");
  assertTimestamp(snapshot.generatedAt, "odds.generatedAt");
  assertExactKeys(snapshot.bookmaker, ["key", "name"], "odds.bookmaker");
  assert(
    snapshot.bookmaker.key === BOOKMAKER.key && snapshot.bookmaker.name === BOOKMAKER.name,
    "le bookmaker Betclic (FR) est obligatoire.",
  );
  assertWindow(snapshot.window, "odds.window");
  assert(Array.isArray(snapshot.events), "odds.events doit être une liste.");
  const eventIds = new Set();
  snapshot.events.forEach((event, index) => {
    const label = `odds.events[${index}]`;
    assertExactKeys(
      event,
      [
        "eventId",
        "sportKey",
        "sportTitle",
        "participantA",
        "participantB",
        "startsAt",
        "observedAt",
        "market",
      ],
      label,
    );
    for (const field of ["eventId", "sportKey", "sportTitle", "participantA", "participantB"]) {
      assertNonEmptyString(event[field], `${label}.${field}`);
    }
    assert(!eventIds.has(event.eventId), `${label}.eventId est dupliqué.`);
    eventIds.add(event.eventId);
    assert(event.participantA !== event.participantB, `${label} a deux participants identiques.`);
    assertTimestamp(event.startsAt, `${label}.startsAt`);
    assertTimestamp(event.observedAt, `${label}.observedAt`);
    const lead = Date.parse(event.startsAt) - Date.parse(event.observedAt);
    assert(
      lead >= SCAN_CONFIG.minimumLeadMinutes * 60_000,
      `${label} commence dans moins de ${SCAN_CONFIG.minimumLeadMinutes} minutes.`,
    );
    assert(
      lead <= SCAN_CONFIG.maximumLeadHours * 60 * 60_000,
      `${label} commence dans plus de ${SCAN_CONFIG.maximumLeadHours} heures.`,
    );
    assertExactKeys(event.market, ["key", "outcomes"], `${label}.market`);
    assert(event.market.key === ODDS_QUERY.market, `${label}.market.key doit valoir h2h.`);
    assert(
      Array.isArray(event.market.outcomes) &&
        event.market.outcomes.length >= 2 &&
        event.market.outcomes.length <= 3,
      `${label}.market.outcomes doit contenir deux ou trois issues.`,
    );
    const outcomeNames = new Set();
    event.market.outcomes.forEach((outcome, outcomeIndex) => {
      const outcomeLabel = `${label}.market.outcomes[${outcomeIndex}]`;
      assertExactKeys(outcome, ["name", "odds"], outcomeLabel);
      assertNonEmptyString(outcome.name, `${outcomeLabel}.name`);
      assert(!outcomeNames.has(outcome.name), `${outcomeLabel}.name est dupliqué.`);
      outcomeNames.add(outcome.name);
      assert(
        typeof outcome.odds === "string" &&
          DECIMAL_ODDS.test(outcome.odds) &&
          Number(outcome.odds) > 1,
        `${outcomeLabel}.odds est invalide.`,
      );
    });
    assert(outcomeNames.has(event.participantA), `${label} ne contient pas participantA.`);
    assert(outcomeNames.has(event.participantB), `${label} ne contient pas participantB.`);
  });
  assertSortedEvents(snapshot.events, "odds.events");
}

function validateResultsSnapshot(snapshot) {
  assertExactKeys(snapshot, ["schemaVersion", "generatedAt", "events"], "results");
  assert(snapshot.schemaVersion === 2, "results.schemaVersion doit valoir 2.");
  assertTimestamp(snapshot.generatedAt, "results.generatedAt");
  assert(Array.isArray(snapshot.events), "results.events doit être une liste.");
  snapshot.events.forEach((event, index) => {
    const label = `results.events[${index}]`;
    assertExactKeys(
      event,
      [
        "eventId",
        "sportKey",
        "participantA",
        "participantB",
        "startsAt",
        "completed",
        "status",
        "scores",
      ],
      label,
    );
    for (const field of ["eventId", "sportKey", "participantA", "participantB"]) {
      assertNonEmptyString(event[field], `${label}.${field}`);
    }
    assertTimestamp(event.startsAt, `${label}.startsAt`);
    assert(
      ["complete", "incomplete", "ambiguous"].includes(event.status),
      `${label}.status est invalide.`,
    );
    if (event.completed) {
      assert(event.status === "complete", `${label} terminé doit avoir le statut complete.`);
      assert(
        Array.isArray(event.scores) && event.scores.length >= 2,
        `${label}.scores est invalide.`,
      );
      const scoreNames = new Set();
      event.scores.forEach((score, scoreIndex) => {
        const scoreLabel = `${label}.scores[${scoreIndex}]`;
        assertExactKeys(score, ["name", "value"], scoreLabel);
        assertNonEmptyString(score.name, `${scoreLabel}.name`);
        assertNonEmptyString(score.value, `${scoreLabel}.value`);
        assert(!scoreNames.has(score.name), `${scoreLabel}.name est dupliqué.`);
        scoreNames.add(score.name);
      });
    } else {
      assert(event.scores === null, `${label} incomplet ou ambigu ne doit pas exposer de scores.`);
    }
  });
  assertSortedEvents(snapshot.events, "results.events");
}

function validateMetadata(metadata) {
  assertExactKeys(
    metadata,
    [
      "schemaVersion",
      "generatedAt",
      "mode",
      "sourceMode",
      "coverage",
      "window",
      "requests",
      "eventsReceived",
      "eventsPublished",
      "quota",
    ],
    "metadata",
  );
  assert(metadata.schemaVersion === 2, "metadata.schemaVersion doit valoir 2.");
  assertTimestamp(metadata.generatedAt, "metadata.generatedAt");
  assert(["odds", "results", "all"].includes(metadata.mode), "metadata.mode est invalide.");
  const expectedSourceMode =
    metadata.mode === "odds"
      ? "upcoming"
      : metadata.mode === "results"
        ? "scores"
        : "upcoming+scores";
  assert(metadata.sourceMode === expectedSourceMode, "metadata.sourceMode est incohérent.");
  assertExactKeys(
    metadata.coverage,
    ["maximumUpcomingEvents", "liveEventsMayBeReturnedUpstream"],
    "metadata.coverage",
  );
  assert(
    metadata.coverage.maximumUpcomingEvents === SCAN_CONFIG.maximumUpcomingEvents,
    "metadata.coverage.maximumUpcomingEvents est invalide.",
  );
  assert(
    metadata.coverage.liveEventsMayBeReturnedUpstream === true,
    "metadata.coverage.liveEventsMayBeReturnedUpstream doit valoir true.",
  );
  assertWindow(metadata.window, "metadata.window");
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
