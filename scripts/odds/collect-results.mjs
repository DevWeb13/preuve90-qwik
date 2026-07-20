import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isAllowedSportKey } from "./config.mjs";
import { normalizeScoreEvents } from "./normalize.mjs";

function requiredString(value, pathLabel) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${pathLabel} doit être une chaîne non vide.`);
  }
  return value;
}

function canonicalTimestamp(value, pathLabel) {
  const timestamp = requiredString(value, pathLabel);
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${pathLabel} est invalide.`);
  return parsed.toISOString();
}

async function readJsonDirectory(directory) {
  let filenames;
  try {
    filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".json")).sort();
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }

  return Promise.all(
    filenames.map(async (filename) => {
      const filepath = path.join(directory, filename);
      try {
        return JSON.parse(await readFile(filepath, "utf8"));
      } catch {
        throw new Error(`Contenu JSON invalide : ${filepath}.`);
      }
    }),
  );
}

export async function loadContentFacts(contentRoot = path.join(process.cwd(), "src/content")) {
  const [predictions, settlements] = await Promise.all([
    readJsonDirectory(path.join(contentRoot, "predictions")),
    readJsonDirectory(path.join(contentRoot, "settlements")),
  ]);
  return { predictions, settlements };
}

export function findPendingPredictions(predictions, settlements, now) {
  const settledPredictionIds = new Set(
    settlements.map((settlement, index) =>
      requiredString(settlement?.predictionId, `settlements[${index}].predictionId`),
    ),
  );
  const eventIds = new Set();
  const pending = [];

  predictions.forEach((prediction, index) => {
    const prefix = `predictions[${index}]`;
    const id = requiredString(prediction?.id, `${prefix}.id`);
    if (settledPredictionIds.has(id)) return;
    const sportKey = requiredString(prediction?.competition?.key, `${prefix}.competition.key`);
    if (!isAllowedSportKey(sportKey)) return;
    const kickoffAt = canonicalTimestamp(prediction?.kickoffAt, `${prefix}.kickoffAt`);
    if (Date.parse(kickoffAt) > Date.parse(now)) return;
    const eventId = requiredString(prediction?.match?.eventId, `${prefix}.match.eventId`);
    if (eventIds.has(eventId)) throw new Error(`Identifiant de match dupliqué : ${eventId}.`);
    eventIds.add(eventId);
    pending.push({
      predictionId: id,
      eventId,
      sportKey,
      homeTeam: requiredString(prediction?.match?.homeTeam, `${prefix}.match.homeTeam`),
      awayTeam: requiredString(prediction?.match?.awayTeam, `${prefix}.match.awayTeam`),
      kickoffAt,
    });
  });

  return pending.sort(
    (left, right) =>
      left.kickoffAt.localeCompare(right.kickoffAt) || left.eventId.localeCompare(right.eventId),
  );
}

/** @param {any} options */
export async function collectResults(options) {
  const { client, generatedAt, contentRoot, predictions, settlements } = options;
  const facts =
    predictions && settlements ? { predictions, settlements } : await loadContentFacts(contentRoot);
  const pending = findPendingPredictions(facts.predictions, facts.settlements, generatedAt);
  const startingRequests = client.getStats().requests;
  const competitions = [...new Set(pending.map((prediction) => prediction.sportKey))].sort();
  const events = [];
  let eventsReceived = 0;

  for (const sportKey of competitions) {
    const targets = pending.filter((prediction) => prediction.sportKey === sportKey);
    const response = await client.getScores(
      sportKey,
      targets.map((target) => target.eventId),
    );
    eventsReceived += response.data.length;
    events.push(...normalizeScoreEvents(response.data, targets));
  }

  events.sort(
    (left, right) =>
      left.kickoffAt.localeCompare(right.kickoffAt) || left.eventId.localeCompare(right.eventId),
  );
  const stats = client.getStats();

  return {
    snapshot: { schemaVersion: 1, generatedAt, events },
    metadata: {
      competitions,
      requests: stats.requests - startingRequests,
      eventsReceived,
      eventsPublished: events.length,
      quota: stats.quota,
    },
  };
}
