import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createOddsApiClient, requireApiKey } from "../../scripts/odds/api-client.mjs";
import { createApiBudget, readQuotaHeaders } from "../../scripts/odds/budget.mjs";
import { collectResults, findPendingPredictions } from "../../scripts/odds/collect-results.mjs";
import { normalizeOddsEvents, normalizeScoreEvents } from "../../scripts/odds/normalize.mjs";
import { runPipeline } from "../../scripts/odds/pipeline.mjs";
import { validateSnapshotSet } from "../../scripts/odds/write-snapshots.mjs";

const FAKE_KEY = "known-fake-secret-never-log";
const NOW = "2026-07-20T08:00:00.000Z";
const fixtureDirectory = fileURLToPath(
  new URL("../../tests/fixtures/odds-api/", import.meta.url),
);
const oddsFixture = JSON.parse(
  readFileSync(path.join(fixtureDirectory, "odds-response.json"), "utf8"),
);
const scoresFixture = JSON.parse(
  readFileSync(path.join(fixtureDirectory, "scores-response.json"), "utf8"),
);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

function quotaHeaders(overrides: Record<string, string> = {}) {
  return new Headers({
    "x-requests-used": "10",
    "x-requests-remaining": "490",
    "x-requests-last": "1",
    ...overrides,
  });
}

function jsonResponse(data: unknown, options: { status?: number; headers?: Headers } = {}) {
  return new Response(JSON.stringify(data), {
    status: options.status ?? 200,
    headers: options.headers ?? quotaHeaders(),
  });
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function normalizedOdds(raw = clone(oddsFixture), sportKey = "soccer_france_ligue_one") {
  return normalizeOddsEvents(raw, { sportKey, observedAt: NOW });
}

function pendingPrediction(overrides: Record<string, unknown> = {}) {
  return {
    id: "prediction-result-valid",
    kickoffAt: "2026-07-19T18:45:00Z",
    competition: { key: "soccer_france_ligue_one", name: "Ligue 1" },
    match: {
      eventId: "event-result-valid",
      homeTeam: "Paris FC",
      awayTeam: "Lyon FC",
    },
    ...overrides,
  };
}

function resultTarget() {
  return findPendingPredictions([pendingPrediction()], [], NOW);
}

async function makeTemporaryDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), "preuve90-odds-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

function pipelineFetch() {
  let used = 0;
  return vi.fn(async (request: RequestInfo | URL) => {
    used += 1;
    const url =
      request instanceof Request
        ? new URL(request.url)
        : new URL(typeof request === "string" ? request : request.toString());
    const sportKey = url.pathname.split("/")[3];
    const headers = quotaHeaders({
      "x-requests-used": String(used),
      "x-requests-remaining": String(500 - used),
      "x-requests-last": url.pathname.endsWith("/scores") ? "2" : "1",
    });
    if (url.pathname.endsWith("/scores")) return jsonResponse(scoresFixture, { headers });
    const events = clone(oddsFixture);
    events[0].sport_key = sportKey;
    events[0].id = `${sportKey}-event`;
    return jsonResponse(events, { headers });
  });
}

describe("configuration et client The Odds API", () => {
  it("refuse un secret absent sans révéler la fausse clé", () => {
    expect(() => requireApiKey({})).toThrow("THE_ODDS_API_KEY est requis");
    try {
      requireApiKey({});
    } catch (error) {
      expect(String(error)).not.toContain(FAKE_KEY);
    }
  });

  it("refuse une compétition non autorisée avant fetch", async () => {
    const fetchImpl = vi.fn();
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl });
    await expect(client.getOdds("soccer_other", NOW)).rejects.toThrow("non autorisée");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("limite la requête de cotes aux paramètres officiels nécessaires", async () => {
    const requestedUrls: URL[] = [];
    const client = createOddsApiClient({
      apiKey: FAKE_KEY,
      fetchImpl: async (request) => {
        requestedUrls.push(request instanceof URL ? request : new URL(request.toString()));
        return jsonResponse([]);
      },
    });
    await client.getOdds("soccer_france_ligue_one", NOW);
    const [requestedUrl] = requestedUrls;
    expect(requestedUrl.pathname).toBe("/v4/sports/soccer_france_ligue_one/odds");
    expect(Object.fromEntries(requestedUrl.searchParams)).toEqual({
      bookmakers: "betclic_fr",
      commenceTimeFrom: NOW,
      dateFormat: "iso",
      markets: "h2h",
      oddsFormat: "decimal",
      regions: "fr",
      apiKey: FAKE_KEY,
    });
  });

  it("filtre la requête de scores par compétition et identifiants utiles", async () => {
    const requestedUrls: URL[] = [];
    const client = createOddsApiClient({
      apiKey: FAKE_KEY,
      fetchImpl: async (request) => {
        requestedUrls.push(request instanceof URL ? request : new URL(request.toString()));
        return jsonResponse([]);
      },
    });
    await client.getScores("soccer_epl", ["event-b", "event-a", "event-a"]);
    const [requestedUrl] = requestedUrls;
    expect(requestedUrl.pathname).toBe("/v4/sports/soccer_epl/scores");
    expect(requestedUrl.searchParams.get("daysFrom")).toBe("3");
    expect(requestedUrl.searchParams.get("eventIds")).toBe("event-a,event-b");
  });

  it("lit les trois en-têtes de quota officiels", () => {
    expect(readQuotaHeaders(quotaHeaders())).toEqual({
      used: 10,
      remaining: 490,
      lastRequestCost: 1,
    });
  });

  it("bloque un appel supplémentaire quand la marge est atteinte", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([], {
        headers: quotaHeaders({ "x-requests-used": "451", "x-requests-remaining": "49" }),
      }),
    );
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl });
    await client.getOdds("soccer_france_ligue_one", NOW);
    await expect(client.getOdds("soccer_epl", NOW)).rejects.toThrow("marge minimale");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("ne répète pas une requête identique même après un quota faible", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([], {
        headers: quotaHeaders({ "x-requests-used": "451", "x-requests-remaining": "49" }),
      }),
    );
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl });
    await client.getOdds("soccer_france_ligue_one", NOW);
    await client.getOdds("soccer_france_ligue_one", NOW);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("conserve null et journalise les en-têtes absents", () => {
    const warn = vi.fn();
    const budget = createApiBudget({ logger: { warn } as unknown as Console });
    expect(budget.record(new Headers())).toEqual({
      used: null,
      remaining: null,
      lastRequestCost: null,
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("rejette une réponse API invalide", async () => {
    const client = createOddsApiClient({
      apiKey: FAKE_KEY,
      fetchImpl: async () => jsonResponse({ invalid: true }),
    });
    await expect(client.getOdds("soccer_epl", NOW)).rejects.toThrow("réponse de cotes");
  });

  it("signale une erreur HTTP sans corps, URL ni clé", async () => {
    const client = createOddsApiClient({
      apiKey: FAKE_KEY,
      fetchImpl: async () => jsonResponse({ message: FAKE_KEY }, { status: 429 }),
    });
    let message = "";
    try {
      await client.getOdds("soccer_epl", NOW);
    } catch (error) {
      message = String(error);
    }
    expect(message).toContain("HTTP 429");
    expect(message).not.toContain(FAKE_KEY);
    expect(message).not.toContain("apiKey=");
  });
});

describe("normalisation des cotes", () => {
  it("exclut un événement sans Betclic", () => {
    const raw = clone(oddsFixture);
    raw[0].bookmakers[0].key = "other";
    expect(normalizedOdds(raw)).toEqual([]);
  });

  it("exclut un marché 1N2 incomplet", () => {
    const raw = clone(oddsFixture);
    raw[0].bookmakers[0].markets[0].outcomes.pop();
    expect(normalizedOdds(raw)).toEqual([]);
  });

  it("exclut un match déjà commencé", () => {
    const raw = clone(oddsFixture);
    raw[0].commence_time = "2026-07-20T07:59:59Z";
    expect(normalizedOdds(raw)).toEqual([]);
  });

  it("publie un match valide avec des cotes chaînes", () => {
    const [event] = normalizedOdds();
    expect(event.odds).toEqual({ home: "1.85", draw: "3.40", away: "4.20" });
    expect(Object.values(event.odds).every((odd) => typeof odd === "string")).toBe(true);
  });

  it("applique un tri déterministe par coup d’envoi puis identifiant", () => {
    const raw = [
      { ...clone(oddsFixture[0]), id: "z-event" },
      { ...clone(oddsFixture[0]), id: "a-event" },
    ];
    expect(normalizedOdds(raw).map((event) => event.eventId)).toEqual(["a-event", "z-event"]);
  });
});

describe("normalisation des résultats", () => {
  it("conserve un score terminé sans produire de statut métier", () => {
    expect(normalizeScoreEvents(scoresFixture, resultTarget())).toEqual([
      expect.objectContaining({ completed: true, status: "complete", score: { home: 2, away: 1 } }),
    ]);
    expect(JSON.stringify(normalizeScoreEvents(scoresFixture, resultTarget()))).not.toMatch(
      /WON|LOST|VOID/,
    );
  });

  it("marque un score en cours comme incomplet et masque son score", () => {
    const raw = clone(scoresFixture);
    raw[0].completed = false;
    expect(normalizeScoreEvents(raw, resultTarget())[0]).toEqual(
      expect.objectContaining({ completed: false, status: "incomplete", score: null }),
    );
  });

  it("marque un résultat terminé mais ambigu comme non terminé", () => {
    const raw = clone(scoresFixture);
    raw[0].scores = [{ name: "Paris FC", score: "2" }];
    expect(normalizeScoreEvents(raw, resultTarget())[0]).toEqual(
      expect.objectContaining({ completed: false, status: "ambiguous", score: null }),
    );
  });

  it("n’appelle pas l’API lorsqu’aucun pronostic n’attend de résultat", async () => {
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl: vi.fn() });
    const result = await collectResults({
      client,
      generatedAt: NOW,
      predictions: [],
      settlements: [],
    });
    expect(result.snapshot.events).toEqual([]);
    expect(result.metadata.requests).toBe(0);
  });
});

describe("snapshots et modes", () => {
  it.each(["odds", "results", "all"] as const)("exécute le mode %s", async (mode) => {
    const outputDirectory = await makeTemporaryDirectory();
    const fetchImpl = pipelineFetch();
    const snapshotSet = await runPipeline({
      mode,
      outputDirectory,
      environment: { THE_ODDS_API_KEY: FAKE_KEY },
      fetchImpl,
      clock: () => new Date(NOW),
      logger: { info: vi.fn(), warn: vi.fn() } as unknown as Console,
      predictions: mode === "odds" ? undefined : [pendingPrediction()],
      settlements: mode === "odds" ? undefined : [],
    });
    expect(snapshotSet.metadata.mode).toBe(mode);
    expect(await readFile(path.join(outputDirectory, "metadata.json"), "utf8")).toContain(
      `"mode": "${mode}"`,
    );
  });

  it("ne publie ni secret, ni URL sensible, ni donnée brute", async () => {
    const outputDirectory = await makeTemporaryDirectory();
    const snapshotSet = await runPipeline({
      mode: "odds",
      outputDirectory,
      environment: { THE_ODDS_API_KEY: FAKE_KEY },
      fetchImpl: pipelineFetch(),
      clock: () => new Date(NOW),
      logger: { info: vi.fn(), warn: vi.fn() } as unknown as Console,
    });
    expect(() => validateSnapshotSet(snapshotSet)).not.toThrow();
    const serialized = JSON.stringify(snapshotSet);
    expect(serialized).not.toContain(FAKE_KEY);
    expect(serialized).not.toContain("apiKey=");
    expect(serialized).not.toContain("api.the-odds-api.com");
    expect(serialized).not.toContain("bookmakers");
    expect(serialized).not.toContain("markets");
    expect(serialized).not.toContain("last_update");
    expect(Object.keys(snapshotSet.odds.events[0]).sort()).toEqual(
      [
        "awayTeam",
        "competitionName",
        "eventId",
        "homeTeam",
        "kickoffAt",
        "observedAt",
        "odds",
        "sportKey",
      ].sort(),
    );
  });
});
