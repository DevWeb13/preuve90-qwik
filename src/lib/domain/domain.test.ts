import { describe, expect, it } from "vitest";
import { assemblePredictions } from "./content";
import { calendarDayNumber, differenceInCalendarDays, getDateKeyInTimeZone } from "./calendar";
import { getRealizedReturnCents, multiplyCentsByDecimal, parseDecimalOdds } from "./money";
import {
  createPredictionView,
  getExpectedSettlementStatus,
  getMatchOutcome,
  groupPredictionsByPublicationDay,
  selectPredictionsForDate,
  sortPredictionsNewestFirst,
} from "./predictions";
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

function sameDayPrediction(index: number, publicationDate = "2026-01-02"): Prediction {
  const publishedHour = String(8 + index).padStart(2, "0");
  const kickoffHour = String(14 + index).padStart(2, "0");
  const eventId = `event-${publicationDate}-${index}`;
  return prediction({
    id: `prediction-${publicationDate}-${index}`,
    publicationDate,
    publishedAt: `${publicationDate}T${publishedHour}:00:00Z`,
    kickoffAt: `${publicationDate}T${kickoffHour}:00:00Z`,
    match: { eventId, homeTeam: `Domicile ${index}`, awayTeam: `Extérieur ${index}` },
    source: { provider: "the-odds-api", eventId },
  });
}

function settlementFor(
  item: Prediction,
  status: Settlement["status"],
  finalScore: Settlement["finalScore"],
): Settlement {
  return settlement({
    predictionId: item.id,
    settledAt: `${item.publicationDate}T23:30:00Z`,
    status,
    finalScore,
    source: { provider: "the-odds-api", eventId: item.match.eventId },
  });
}

describe("journées civiles Europe/Paris", () => {
  it("produit une clé pour une date ordinaire", () => {
    expect(getDateKeyInTimeZone("2026-01-15T12:00:00Z", "Europe/Paris")).toBe("2026-01-15");
  });

  it("gère le changement de journée entre UTC et Paris", () => {
    expect(getDateKeyInTimeZone("2026-01-15T23:30:00Z", "Europe/Paris")).toBe("2026-01-16");
  });

  it("gère le passage à l’heure d’été sans fausser les journées", () => {
    expect(getDateKeyInTimeZone("2026-03-28T23:30:00Z", "Europe/Paris")).toBe("2026-03-29");
    expect(getDateKeyInTimeZone("2026-03-29T22:30:00Z", "Europe/Paris")).toBe("2026-03-30");
    expect(differenceInCalendarDays("2026-03-29", "2026-03-30")).toBe(1);
  });

  it("gère le passage à l’heure d’hiver sans fausser les journées", () => {
    expect(getDateKeyInTimeZone("2026-10-24T22:30:00Z", "Europe/Paris")).toBe("2026-10-25");
    expect(getDateKeyInTimeZone("2026-10-25T23:30:00Z", "Europe/Paris")).toBe("2026-10-26");
    expect(differenceInCalendarDays("2026-10-25", "2026-10-26")).toBe(1);
  });

  it("rejette une clé calendaire impossible", () => {
    expect(() => calendarDayNumber("2026-02-30")).toThrow("impossible");
  });

  it("groupe plusieurs publications du même jour et gère une liste vide", () => {
    const views = [sameDayPrediction(2), sameDayPrediction(0), sameDayPrediction(1)].map((item) =>
      createPredictionView(item),
    );
    expect(groupPredictionsByPublicationDay([], "Europe/Paris")).toEqual([]);
    expect(selectPredictionsForDate(views, "2026-01-02", "Europe/Paris").map((item) => item.id)).toEqual([
      "prediction-2026-01-02-0",
      "prediction-2026-01-02-1",
      "prediction-2026-01-02-2",
    ]);
  });
});

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

  it("comptabilise toutes les mises individuelles d’une même journée", () => {
    const views = Array.from({ length: 5 }, (_, index) =>
      createPredictionView(sameDayPrediction(index)),
    );
    const stats = calculateStatistics(views, new Date("2026-01-02T22:00:00Z"));
    expect(stats.totalPredictions).toBe(5);
    expect(stats.totalVirtualStakeCents).toBe(2500);
    expect(stats.pendingPredictions).toBe(5);
  });
});

describe("cohérence des résultats", () => {
  it("détermine une victoire à domicile", () => {
    expect(getMatchOutcome({ home: 2, away: 0 })).toBe("HOME");
    expect(getExpectedSettlementStatus("HOME", { home: 2, away: 0 })).toBe("WON");
  });

  it("détermine une sélection domicile perdue", () => {
    expect(getExpectedSettlementStatus("HOME", { home: 0, away: 1 })).toBe("LOST");
  });

  it("détermine un nul gagné", () => {
    expect(getMatchOutcome({ home: 1, away: 1 })).toBe("DRAW");
    expect(getExpectedSettlementStatus("DRAW", { home: 1, away: 1 })).toBe("WON");
  });

  it("détermine un nul perdu", () => {
    expect(getExpectedSettlementStatus("DRAW", { home: 2, away: 1 })).toBe("LOST");
  });

  it("détermine une victoire à l’extérieur", () => {
    expect(getMatchOutcome({ home: 0, away: 3 })).toBe("AWAY");
    expect(getExpectedSettlementStatus("AWAY", { home: 0, away: 3 })).toBe("WON");
  });

  it("détermine une sélection extérieure perdue", () => {
    expect(getExpectedSettlementStatus("AWAY", { home: 2, away: 0 })).toBe("LOST");
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

  it("accepte deux pronostics différents publiés le même jour", () => {
    expect(assemblePredictions([sameDayPrediction(0), sameDayPrediction(1)], [])).toHaveLength(2);
  });

  it("accepte cinq pronostics différents publiés le même jour", () => {
    const predictions = Array.from({ length: 5 }, (_, index) => sameDayPrediction(index));
    expect(assemblePredictions(predictions, [])).toHaveLength(5);
  });

  it("rejette deux publications portant le même eventId", () => {
    const first = sameDayPrediction(0);
    const duplicateMatch = {
      ...sameDayPrediction(1),
      match: { ...sameDayPrediction(1).match, eventId: first.match.eventId },
      source: { provider: "the-odds-api" as const, eventId: first.match.eventId },
    };
    expect(() => assemblePredictions([first, duplicateMatch], [])).toThrow(
      "Match publié plusieurs fois",
    );
  });

  it("trie plusieurs journées et les matchs de chaque jour par coup d’envoi", () => {
    const inputs = [
      sameDayPrediction(1, "2026-01-02"),
      sameDayPrediction(0, "2026-01-03"),
      sameDayPrediction(0, "2026-01-02"),
      sameDayPrediction(1, "2026-01-03"),
    ];
    const groups = groupPredictionsByPublicationDay(
      assemblePredictions(inputs, []),
      "Europe/Paris",
    );
    expect(groups.map((group) => group.dateKey)).toEqual(["2026-01-03", "2026-01-02"]);
    expect(groups[0].predictions.map((item) => item.id)).toEqual([
      "prediction-2026-01-03-0",
      "prediction-2026-01-03-1",
    ]);
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

  it("rejette un faux statut WON", () => {
    const item = sameDayPrediction(0);
    expect(() =>
      assemblePredictions([item], [settlementFor(item, "WON", { home: 0, away: 1 })]),
    ).toThrow("Statut WON incohérent");
  });

  it("rejette un faux statut LOST", () => {
    const item = sameDayPrediction(0);
    expect(() =>
      assemblePredictions([item], [settlementFor(item, "LOST", { home: 2, away: 0 })]),
    ).toThrow("Statut LOST incohérent");
  });

  it("accepte VOID indépendamment du score", () => {
    const item = sameDayPrediction(0);
    expect(
      assemblePredictions([item], [settlementFor(item, "VOID", { home: 9, away: 0 })])[0]
        .status,
    ).toBe("VOID");
  });

  it("comptabilise plusieurs règlements indépendants du même jour", () => {
    const won = sameDayPrediction(0);
    const lost = sameDayPrediction(1);
    const views = assemblePredictions(
      [won, lost],
      [
        settlementFor(won, "WON", { home: 2, away: 0 }),
        settlementFor(lost, "LOST", { home: 0, away: 1 }),
      ],
    );
    const stats = calculateStatistics(views, new Date("2026-01-02T22:30:00Z"));
    expect(stats.settledPredictions).toBe(2);
    expect(stats.wonPredictions).toBe(1);
    expect(stats.lostPredictions).toBe(1);
    expect(stats.totalSettledStakeCents).toBe(1000);
  });

  it("rejette un timestamp ISO impossible sans normalisation JavaScript", () => {
    const invalid = prediction({
      publicationDate: "2026-03-02",
      publishedAt: "2026-02-30T08:00:00Z",
    });
    expect(() => assemblePredictions([invalid], [])).toThrow("timestamp est invalide");
  });
});
