import path from "node:path";
import { createOddsApiClient, requireApiKey } from "./api-client.mjs";
import { BOOKMAKER, SCAN_CONFIG } from "./config.mjs";
import { collectOdds } from "./collect-odds.mjs";
import { collectResults } from "./collect-results.mjs";
import { writeSnapshotSet } from "./write-snapshots.mjs";

const MODES = new Set(["odds", "results", "all"]);

function emptyOddsSnapshot(generatedAt) {
  return {
    schemaVersion: 2,
    generatedAt,
    bookmaker: BOOKMAKER,
    window: {
      minimumLeadMinutes: SCAN_CONFIG.minimumLeadMinutes,
      maximumLeadHours: SCAN_CONFIG.maximumLeadHours,
    },
    events: [],
  };
}

function emptyResultsSnapshot(generatedAt) {
  return { schemaVersion: 2, generatedAt, events: [] };
}

function aggregateMetadata(mode, generatedAt, parts, client) {
  return {
    schemaVersion: 2,
    generatedAt,
    mode,
    sourceMode: mode === "odds" ? "upcoming" : mode === "results" ? "scores" : "upcoming+scores",
    coverage: {
      maximumUpcomingEvents: SCAN_CONFIG.maximumUpcomingEvents,
      liveEventsMayBeReturnedUpstream: true,
    },
    window: {
      minimumLeadMinutes: SCAN_CONFIG.minimumLeadMinutes,
      maximumLeadHours: SCAN_CONFIG.maximumLeadHours,
    },
    requests: parts.reduce((total, part) => total + part.requests, 0),
    eventsReceived: parts.reduce((total, part) => total + part.eventsReceived, 0),
    eventsPublished: parts.reduce((total, part) => total + part.eventsPublished, 0),
    quota: client.getStats().quota,
  };
}

/** @param {any} options */
export async function runPipeline(options = {}) {
  const {
    mode,
    outputDirectory = path.join(process.cwd(), "tmp/snapshots"),
    environment = process.env,
    fetchImpl = globalThis.fetch,
    clock = () => new Date(),
    logger = console,
    contentRoot,
    predictions,
    settlements,
  } = options;
  if (!MODES.has(mode)) throw new Error(`Mode de collecte invalide : ${mode}.`);
  const apiKey = requireApiKey(environment);
  const generatedAt = clock().toISOString();
  const client = createOddsApiClient({ apiKey, fetchImpl, clock, logger });
  let odds = emptyOddsSnapshot(generatedAt);
  let results = emptyResultsSnapshot(generatedAt);
  const metadataParts = [];

  if (mode === "odds" || mode === "all") {
    const collectedOdds = await collectOdds({ client, generatedAt });
    odds = collectedOdds.snapshot;
    metadataParts.push(collectedOdds.metadata);
  }

  if (mode === "results" || mode === "all") {
    const collectedResults = await collectResults({
      client,
      generatedAt,
      contentRoot,
      predictions,
      settlements,
    });
    results = collectedResults.snapshot;
    metadataParts.push(collectedResults.metadata);
  }

  const snapshotSet = {
    odds,
    results,
    metadata: aggregateMetadata(mode, generatedAt, metadataParts, client),
  };
  await writeSnapshotSet(outputDirectory, snapshotSet);
  logger.info(
    `Snapshots ${mode} écrits : ${snapshotSet.metadata.eventsPublished} événement(s), ${snapshotSet.metadata.requests} requête(s).`,
  );
  return snapshotSet;
}

function parseArguments(argv) {
  const options = { mode: null, outputDirectory: path.join(process.cwd(), "tmp/snapshots") };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--mode") options.mode = argv[++index];
    else if (argv[index] === "--output") options.outputDirectory = path.resolve(argv[++index]);
    else throw new Error(`Argument inconnu : ${argv[index]}.`);
  }
  return options;
}

export async function runPipelineCli(defaultMode = null) {
  try {
    const options = parseArguments(process.argv.slice(2));
    await runPipeline({
      mode: defaultMode ?? options.mode,
      outputDirectory: options.outputDirectory,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Échec de la collecte The Odds API.");
    process.exitCode = 1;
  }
}
