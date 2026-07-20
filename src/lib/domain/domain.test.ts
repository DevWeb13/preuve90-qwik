import { describe, expect, it } from "vitest";
import { assemblePredictions } from "./content";
import { getRealizedReturnCents, multiplyCentsByDecimal, parseDecimalOdds } from "./money";
import { createPredictionView, sortPredictionsNewestFirst } from "./predictions";
import { calculateStatistics } from "./statistics";
import type { Prediction, Settlement } from "~/types/prediction";

function prediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "prediction-1",
    publicationDate: "2026-01-02",
    publishedAt: "2026-01-02T08:00:00Z",
    kickoffAt: "2026-01-02T20:00:00Z",
    competition: { key: "ligue-1", name: "Ligue 1", country: "France" },
    match: { eventId: "event-1", homeTeam: "Équipe A", awayTeam: "Équipe B" },
    selection: "HOME",
    recordedOdds: "1.85",
    bookmaker: { key: "betclic_fr", name: "Betclic (FR)", observedAt: "2026-01-02T07:55:00Z" },
    virtualStakeCents: 500,
    reasoning: { summary: "Résumé test", factors: ["Facteur test"], uncertainty: "Incertitude test" },
    source: { provider: "the-odds-api", eventId: "event-1" },
    ...overrides,
  };
}

function settlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    predictionId: "prediction-1",
    settledAt: "2026-01-02T22:15:00Z",
    status: "WON",
    finalScore: { home: 2, away: 0 },
    source: { provider: "the-odds-api", eventId: "event-1" },
    ...overrides,
  };
}

describe("calculs monétaires", () => {
  it("parse une cote décimale exacte", () => {
    expect(parseDecimalOdds("1.85")).toEqual({ numerator: 185n, denominator: 100n });
    expect(() => parseDecimalOdds("1,85")).toThrow("invalide");
    expect(() => parseDecimalOdds("1.00")).toThrow("supérieure à 1");
  });

  it("calcule et arrondit le retour gagné au centime", () => {
    expect(multiplyCentsByDecimal(500, "1.85")).toBe(925);
    expect(multiplyCentsByDecimal(500, "2.10")).toBe(1050);
    expect(multiplyCentsByDecimal(333, "1.555")).toBe(518);
  });

  it("calcule les retours perdu, annulé et en attente", () => {
    expect(getRealizedReturnCents("LOST", 500, "1.85")).toBe(0);
    expect(getRealizedReturnCents("VOID", 500, "1.85")).toBe(500);
    expect(getRealizedReturnCents("PENDING", 500, "1.85")).toBeNull();
  });
});

describe("dérivation et statistiques", () => {
  it("dérive PENDING de l’absence de règlement", () => {
    const view = createPredictionView(prediction());
    expect(view.status).toBe("PENDING");
    expect(view.realizedReturnCents).toBeNull();
    expect(view.netResultCents).toBeNull();
  });

  it("retourne des statistiques neutres sans donnée", () => {
    const stats = calculateStatistics([], new Date("2026-01-05T00:00:00Z"));
    expect(stats.totalPredictions).toBe(0);
    expect(stats.successRate).toBeNull();
    expect(stats.roi).toBeNull();
    expect(stats.netResultCents).toBe(0);
    expect(stats.cumulativePerformance).toEqual([]);
  });

  it("calcule gagnés, perdus et rendement sans division flottante visible", () => {
    const won = createPredictionView(prediction(), settlement());
    const lostPrediction = prediction({
      id: "prediction-2",
      publicationDate: "2026-01-03",
      publishedAt: "2026-01-03T08:00:00Z",
      kickoffAt: "2026-01-03T20:00:00Z",
      match: { eventId: "event-2", homeTeam: "Équipe C", awayTeam: "Équipe D" },
      source: { provider: "the-odds-api", eventId: "event-2" },
    });
    const lost = createPredictionView(
      lostPrediction,
      settlement({
        predictionId: "prediction-2",
        settledAt: "2026-01-03T22:00:00Z",
        status: "LOST",
        source: { provider: "the-odds-api", eventId: "event-2" },
      }),
    );
    const stats = calculateStatistics([won, lost], new Date("2026-01-05T00:00:00Z"));
    expect(stats.wonPredictions).toBe(1);
    expect(stats.lostPredictions).toBe(1);
    expect(stats.successRate).toBe(0.5);
    expect(stats.totalSettledStakeCents).toBe(1000);
    expect(stats.totalRealizedReturnCents).toBe(925);
    expect(stats.netResultCents).toBe(-75);
    expect(stats.roi).toBe(-0.075);
  });

  it("exclut les annulations du taux de réussite", () => {
    const won = createPredictionView(prediction(), settlement());
    const voidPrediction = prediction({
      id: "prediction-void",
      publicationDate: "2026-01-03",
      publishedAt: "2026-01-03T08:00:00Z",
      kickoffAt: "2026-01-03T20:00:00Z",
      match: { eventId: "event-void", homeTeam: "Équipe C", awayTeam: "Équipe D" },
      source: { provider: "the-odds-api", eventId: "event-void" },
    });
    const voidView = createPredictionView(
      voidPrediction,
      settlement({
        predictionId: "prediction-void",
        settledAt: "2026-01-03T22:00:00Z",
        status: "VOID",
        source: { provider: "the-odds-api", eventId: "event-void" },
      }),
    );
    const stats = calculateStatistics([won, voidView]);
    expect(stats.successRate).toBe(1);
    expect(stats.voidPredictions).toBe(1);
  });

  it("gère les divisions par zéro quand seuls des pronostics pending existent", () => {
    const stats = calculateStatistics([createPredictionView(prediction())]);
    expect(stats.successRate).toBeNull();
    expect(stats.roi).toBeNull();
  });

  it("produit une évolution cumulative chronologique", () => {
    const first = createPredictionView(prediction(), settlement());
    const secondPrediction = prediction({
      id: "prediction-2",
      publicationDate: "2026-01-03",
      publishedAt: "2026-01-03T08:00:00Z",
      kickoffAt: "2026-01-03T20:00:00Z",
      match: { eventId: "event-2", homeTeam: "Équipe C", awayTeam: "Équipe D" },
      source: { provider: "the-odds-api", eventId: "event-2" },
    });
    const second = createPredictionView(
      secondPrediction,
      settlement({
        predictionId: "prediction-2",
        settledAt: "2026-01-03T22:00:00Z",
        status: "LOST",
        source: { provider: "the-odds-api", eventId: "event-2" },
      }),
    );
    expect(calculateStatistics([second, first]).cumulativePerformance).toEqual([
      { predictionId: "prediction-1", publicationDate: "2026-01-02", netResultCents: 425 },
      { predictionId: "prediction-2", publicationDate: "2026-01-03", netResultCents: -75 },
    ]);
  });
});

describe("intégrité du contenu", () => {
  it("trie les publications de la plus récente à la plus ancienne", () => {
    const older = prediction();
    const newer = prediction({
      id: "prediction-2",
      publicationDate: "2026-01-03",
      publishedAt: "2026-01-03T08:00:00Z",
      kickoffAt: "2026-01-03T20:00:00Z",
      match: { eventId: "event-2", homeTeam: "Équipe C", awayTeam: "Équipe D" },
      source: { provider: "the-odds-api", eventId: "event-2" },
    });
    expect(sortPredictionsNewestFirst([older, newer]).map((item) => item.id)).toEqual([
      "prediction-2",
      "prediction-1",
    ]);
  });

  it("rejette les identifiants dupliqués", () => {
    const duplicate = prediction({
      publicationDate: "2026-01-03",
      publishedAt: "2026-01-03T08:00:00Z",
      kickoffAt: "2026-01-03T20:00:00Z",
      match: { eventId: "event-2", homeTeam: "Équipe C", awayTeam: "Équipe D" },
      source: { provider: "the-odds-api", eventId: "event-2" },
    });
    expect(() => assemblePredictions([prediction(), duplicate], [])).toThrow("dupliqué");
  });

  it("rejette plusieurs publications le même jour", () => {
    const sameDay = prediction({
      id: "prediction-2",
      match: { eventId: "event-2", homeTeam: "Équipe C", awayTeam: "Équipe D" },
      source: { provider: "the-odds-api", eventId: "event-2" },
    });
    expect(() => assemblePredictions([prediction(), sameDay], [])).toThrow("Plusieurs publications");
  });

  it("associe le règlement à sa publication", () => {
    const [view] = assemblePredictions([prediction()], [settlement()]);
    expect(view.status).toBe("WON");
    expect(view.settlement?.finalScore).toEqual({ home: 2, away: 0 });
  });

  it("rejette un bookmaker autre que betclic_fr", () => {
    const invalid = { ...prediction(), bookmaker: { key: "other_fr", name: "Autre", observedAt: "2026-01-02T07:55:00Z" } };
    expect(() => assemblePredictions([invalid], [])).toThrow("betclic_fr");
  });

  it("rejette une mise différente de 500 centimes", () => {
    const invalid = { ...prediction(), virtualStakeCents: 1000 };
    expect(() => assemblePredictions([invalid], [])).toThrow("500 centimes");
  });

  it("rejette un règlement sans publication", () => {
    expect(() => assemblePredictions([], [settlement()])).toThrow("aucune publication");
  });
});
