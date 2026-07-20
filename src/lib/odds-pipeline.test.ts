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
const fixtureDirectory = fileURLToPath(new URL("../../tests/fixtures/odds-api/", import.meta.url));
const oddsFixture = JSON.parse(readFileSync(path.join(fixtureDirectory, "odds-response.json"), "utf8"));
const scoresFixture = JSON.parse(readFileSync(path.join(fixtureDirectory, "scores-response.json"), "utf8"));
const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

function quotaHeaders(overrides: Record<string, string> = {}) {
  return new Headers({
    "x-requests-used": "3",
    "x-requests-remaining": "497",
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

function normalizedOdds(raw = clone(oddsFixture), observedAt = NOW) {
  return normalizeOddsEvents(raw, { observedAt });
}

function pendingPrediction(overrides: Record<string, unknown> = {}) {
  return {
    id: "prediction-result-valid",
    startsAt: "2026-07-19T18:45:00Z",
    sport: { key: "soccer_france_ligue_one", title: "Football France" },
    event: { eventId: "event-result-valid", participantA: "Paris FC", participantB: "Lyon FC" },
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
  return vi.fn(async (request: RequestInfo | URL) => {
    const url = new URL(request instanceof Request ? request.url : request.toString());
    if (url.pathname === "/v4/sports/upcoming/odds") return jsonResponse(clone(oddsFixture));
    if (url.pathname.endsWith("/scores")) {
      return jsonResponse(clone(scoresFixture), {
        headers: quotaHeaders({ "x-requests-last": "2" }),
      });
    }
    return jsonResponse([], { status: 404 });
  });
}

describe("client The Odds API", () => {
  it("refuse un secret absent sans révéler la fausse clé", () => {
    expect(() => requireApiKey({})).toThrow("THE_ODDS_API_KEY est requis");
    expect(() => requireApiKey({})).not.toThrow(FAKE_KEY);
  });

  it("utilise /sports/upcoming/odds avec les seuls paramètres stricts", async () => {
    const requestedUrls: URL[] = [];
    const client = createOddsApiClient({
      apiKey: FAKE_KEY,
      fetchImpl: async (request) => {
        requestedUrls.push(request instanceof URL ? request : new URL(request.toString()));
        return jsonResponse([]);
      },
    });
    await client.getUpcomingOdds();
    const [url] = requestedUrls;
    expect(url.pathname).toBe("/v4/sports/upcoming/odds");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      bookmakers: "betclic_fr",
      dateFormat: "iso",
      markets: "h2h",
      oddsFormat: "decimal",
      apiKey: FAKE_KEY,
    });
    expect(url.searchParams.has("commenceTimeFrom")).toBe(false);
    expect(url.searchParams.has("commenceTimeTo")).toBe(false);
  });

  it("filtre les scores par sport et identifiants utiles", async () => {
    const requestedUrls: URL[] = [];
    const client = createOddsApiClient({
      apiKey: FAKE_KEY,
      fetchImpl: async (request) => {
        requestedUrls.push(request instanceof URL ? request : new URL(request.toString()));
        return jsonResponse([]);
      },
    });
    await client.getScores("tennis_atp", ["event-b", "event-a", "event-a"]);
    expect(requestedUrls[0].pathname).toBe("/v4/sports/tennis_atp/scores");
    expect(requestedUrls[0].searchParams.get("eventIds")).toBe("event-a,event-b");
  });

  it("lit le quota et bloque à la marge globale", async () => {
    expect(readQuotaHeaders(quotaHeaders())).toEqual({
      used: 3,
      remaining: 497,
      lastRequestCost: 1,
    });
    const fetchImpl = vi.fn(async () =>
      jsonResponse([], {
        headers: quotaHeaders({ "x-requests-used": "450", "x-requests-remaining": "50" }),
      }),
    );
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl });
    await client.getUpcomingOdds();
    await expect(client.getScores("tennis_atp", ["event-1"])).rejects.toThrow("marge minimale");
  });

  it("conserve null et avertit pour des en-têtes de quota absents", () => {
    const warn = vi.fn();
    const budget = createApiBudget({ logger: { warn } as unknown as Console });
    expect(budget.record(new Headers())).toEqual({
      used: null,
      remaining: null,
      lastRequestCost: null,
    });
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("normalisation du scan upcoming", () => {
  it("exclut un événement live", () => {
    const raw = clone(oddsFixture);
    raw[0].commence_time = "2026-07-20T07:59:59Z";
    expect(normalizedOdds(raw)).toEqual([]);
  });

  it("applique les bornes inclusives de 30 minutes à 8 heures", () => {
    const at29 = clone(oddsFixture);
    at29[0].commence_time = "2026-07-20T08:29:59Z";
    expect(normalizedOdds(at29)).toEqual([]);
    const at30 = clone(oddsFixture);
    at30[0].commence_time = "2026-07-20T08:30:00Z";
    expect(normalizedOdds(at30)).toHaveLength(1);
    const at8h = clone(oddsFixture);
    at8h[0].commence_time = "2026-07-20T16:00:00Z";
    expect(normalizedOdds(at8h)).toHaveLength(1);
    const after8h = clone(oddsFixture);
    after8h[0].commence_time = "2026-07-20T16:00:01Z";
    expect(normalizedOdds(after8h)).toEqual([]);
  });

  it("accepte deux ou trois issues exactes sans imposer Draw", () => {
    const tennis = clone(oddsFixture);
    tennis[0].sport_key = "tennis_atp";
    tennis[0].sport_title = "ATP Test";
    tennis[0].bookmakers[0].markets[0].outcomes = [
      { name: "Paris FC", price: 1.85 },
      { name: "Lyon FC", price: 1.95 },
    ];
    expect(normalizedOdds(tennis)[0].market.outcomes).toEqual([
      { name: "Paris FC", odds: "1.85" },
      { name: "Lyon FC", odds: "1.95" },
    ]);
    expect(normalizedOdds()).toHaveLength(1);
  });

  it("exclut une ou quatre issues, Betclic absent et marché incomplet", () => {
    for (const count of [1, 4]) {
      const raw = clone(oddsFixture);
      raw[0].bookmakers[0].markets[0].outcomes = Array.from({ length: count }, (_, index) => ({
        name: index === 0 ? "Paris FC" : index === 1 ? "Lyon FC" : `Issue ${index}`,
        price: 1.5 + index,
      }));
      expect(normalizedOdds(raw)).toEqual([]);
    }
    const withoutBetclic = clone(oddsFixture);
    withoutBetclic[0].bookmakers[0].key = "other";
    expect(normalizedOdds(withoutBetclic)).toEqual([]);
    const incomplete = clone(oddsFixture);
    incomplete[0].bookmakers[0].markets[0].outcomes = [
      { name: "Paris FC", price: 1.85 },
      { name: "Draw", price: 3.4 },
    ];
    expect(normalizedOdds(incomplete)).toEqual([]);
  });

  it("exclut les noms d’issues dupliqués et les cotes invalides", () => {
    const duplicate = clone(oddsFixture);
    duplicate[0].bookmakers[0].markets[0].outcomes[1].name = "Paris FC";
    expect(normalizedOdds(duplicate)).toEqual([]);
    const invalidOdds = clone(oddsFixture);
    invalidOdds[0].bookmakers[0].markets[0].outcomes[0].price = 1;
    expect(normalizedOdds(invalidOdds)).toEqual([]);
  });

  it("trie par startsAt puis eventId", () => {
    const raw = [
      { ...clone(oddsFixture[0]), id: "z-event" },
      { ...clone(oddsFixture[0]), id: "a-event" },
    ];
    expect(normalizedOdds(raw).map((event) => event.eventId)).toEqual(["a-event", "z-event"]);
  });
});

describe("résultats multisports", () => {
  it("conserve des scores génériques sans statut WON, LOST ou VOID", () => {
    const results = normalizeScoreEvents(scoresFixture, resultTarget());
    expect(results[0]).toEqual(
      expect.objectContaining({
        completed: true,
        status: "complete",
        scores: [
          { name: "Paris FC", value: "2" },
          { name: "Lyon FC", value: "1" },
        ],
      }),
    );
    expect(JSON.stringify(results)).not.toMatch(/WON|LOST|VOID/);
  });

  it("produit incomplete ou ambiguous sans inventer de vainqueur", () => {
    const incomplete = clone(scoresFixture);
    incomplete[0].completed = false;
    expect(normalizeScoreEvents(incomplete, resultTarget())[0]).toEqual(
      expect.objectContaining({ completed: false, status: "incomplete", scores: null }),
    );
    const ambiguous = clone(scoresFixture);
    ambiguous[0].scores = [{ name: "Paris FC", score: "2" }];
    expect(normalizeScoreEvents(ambiguous, resultTarget())[0]).toEqual(
      expect.objectContaining({ completed: false, status: "ambiguous", scores: null }),
    );
  });

  it("n’appelle pas l’API sans pronostic à vérifier", async () => {
    const fetchImpl = vi.fn();
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl });
    const result = await collectResults({ client, generatedAt: NOW, predictions: [], settlements: [] });
    expect(result.snapshot.events).toEqual([]);
    expect(result.metadata.requests).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("regroupe les appels par sport.key", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([]));
    const client = createOddsApiClient({ apiKey: FAKE_KEY, fetchImpl });
    await collectResults({
      client,
      generatedAt: NOW,
      predictions: [
        pendingPrediction(),
        pendingPrediction({
          id: "prediction-2",
          event: { eventId: "event-2", participantA: "A", participantB: "B" },
        }),
        pendingPrediction({
          id: "prediction-3",
          sport: { key: "tennis_atp", title: "ATP" },
          event: { eventId: "event-3", participantA: "C", participantB: "D" },
        }),
      ],
      settlements: [],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
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
    expect(snapshotSet.metadata.schemaVersion).toBe(2);
    expect(await readFile(path.join(outputDirectory, "metadata.json"), "utf8")).toContain(
      `"mode": "${mode}"`,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(mode === "all" ? 2 : 1);
  });

  it("produit le schéma v2 strict, sans secret, URL ou champs bruts", async () => {
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
    expect(snapshotSet.odds).toEqual(
      expect.objectContaining({
        schemaVersion: 2,
        window: { minimumLeadMinutes: 30, maximumLeadHours: 8 },
      }),
    );
    expect(snapshotSet.metadata).toEqual(
      expect.objectContaining({
        sourceMode: "upcoming",
        coverage: { maximumUpcomingEvents: 8, liveEventsMayBeReturnedUpstream: true },
        quota: { used: 3, remaining: 497, lastRequestCost: 1 },
      }),
    );
    const serialized = JSON.stringify(snapshotSet);
    expect(serialized).not.toContain(FAKE_KEY);
    expect(serialized).not.toContain("apiKey=");
    expect(serialized).not.toContain("api.the-odds-api.com");
    expect(serialized).not.toContain("last_update");
    expect(Object.keys(snapshotSet.odds.events[0]).sort()).toEqual(
      [
        "eventId",
        "sportKey",
        "sportTitle",
        "participantA",
        "participantB",
        "startsAt",
        "observedAt",
        "market",
      ].sort(),
    );
  });
});
