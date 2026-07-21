import { describe, expect, it } from "vitest";
import { demoPredictions } from "~/content/demo/predictions";
import { demoSettlements } from "~/content/demo/settlements";
import { assemblePredictions } from "./content";
import { calendarDayNumber, differenceInCalendarDays, getDateKeyInTimeZone } from "./calendar";
import {
  getBreakEvenProbabilityBps,
  getEstimatedValueBps,
  getRealizedReturnCents,
  hasPositiveEstimatedValue,
  multiplyCentsByDecimal,
  parseDecimalOdds,
} from "./money";
import {
  createPredictionView,
  getExpectedSettlementStatus,
  groupPredictionsByPublicationDay,
  selectPredictionsForDate,
  sortPredictionsNewestFirst,
} from "./predictions";
import { calculateStatistics } from "./statistics";
import type { Prediction, Settlement } from "~/types/prediction";

function prediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "prediction-tennis-1",
    publicationDate: "2026-01-02",
    publishedAt: "2026-01-02T08:00:00Z",
    startsAt: "2026-01-02T12:00:00Z",
    sport: { key: "tennis_atp", title: "ATP Test" },
    event: { eventId: "event-1", participantA: "Joueur A", participantB: "Joueur B" },
    market: {
      key: "h2h",
      outcomes: [
        { name: "Joueur A", odds: "1.85" },
        { name: "Joueur B", odds: "1.95" },
      ],
    },
    selection: { name: "Joueur A" },
    recordedOdds: "1.85",
    bookmaker: {
      key: "betclic_fr",
      name: "Betclic (FR)",
      observedAt: "2026-01-02T07:55:00Z",
    },
    virtualStakeCents: 500,
    reasoning: {
      estimatedProbabilityBps: 5800,
      summary: "Résumé test",
      factors: ["Facteur test"],
      uncertainty: "Incertitude test",
    },
    source: {
      provider: "betclic-public",
      eventId: "event-1",
      reference: "https://www.betclic.fr/sport/event-1",
    },
    ...overrides,
  };
}

function settlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    predictionId: "prediction-tennis-1",
    settledAt: "2026-01-02T14:15:00Z",
    status: "WON",
    result: {
      winningOutcomeName: "Joueur A",
      scores: [
        { name: "Joueur A", value: "2" },
        { name: "Joueur B", value: "0" },
      ],
    },
    source: {
      provider: "betclic-public",
      eventId: "event-1",
      reference: "https://www.betclic.fr/sport/event-1",
    },
    ...overrides,
  };
}

function sameDayPrediction(index: number): Prediction {
  const eventId = `event-${index}`;
  return prediction({
    id: `prediction-${index}`,
    publishedAt: `2026-01-02T${String(8 + index).padStart(2, "0")}:00:00Z`,
    startsAt: `2026-01-02T${String(14 + index).padStart(2, "0")}:00:00Z`,
    event: { eventId, participantA: `Participant A ${index}`, participantB: `Participant B ${index}` },
    market: {
      key: "h2h",
      outcomes: [
        { name: `Participant A ${index}`, odds: "1.85" },
        { name: `Participant B ${index}`, odds: "1.95" },
      ],
    },
    selection: { name: `Participant A ${index}` },
    bookmaker: {
      ...prediction().bookmaker,
      observedAt: `2026-01-02T${String(7 + index).padStart(2, "0")}:55:00Z`,
    },
    source: {
      provider: "betclic-public",
      eventId,
      reference: `https://www.betclic.fr/sport/${eventId}`,
    },
  });
}

describe("journées civiles Europe/Paris", () => {
  it("gère UTC, heure d’été et listes d’une même journée", () => {
    expect(getDateKeyInTimeZone("2026-01-15T23:30:00Z", "Europe/Paris")).toBe("2026-01-16");
    expect(differenceInCalendarDays("2026-03-29", "2026-03-30")).toBe(1);
    expect(() => calendarDayNumber("2026-02-30")).toThrow("impossible");
    const views = [sameDayPrediction(2), sameDayPrediction(0), sameDayPrediction(1)].map((item) =>
      createPredictionView(item),
    );
    expect(selectPredictionsForDate(views, "2026-01-02", "Europe/Paris").map((item) => item.id)).toEqual([
      "prediction-0",
      "prediction-1",
      "prediction-2",
    ]);
  });
});

describe("cotes et valeur estimée", () => {
  it("calcule exactement le retour, le seuil implicite et l’espérance", () => {
    expect(parseDecimalOdds("1.85")).toEqual({ numerator: 185n, denominator: 100n });
    expect(multiplyCentsByDecimal(500, "1.85")).toBe(925);
    expect(getBreakEvenProbabilityBps("1.85")).toBe(5405);
    expect(getEstimatedValueBps(5800, "1.85")).toBe(730);
    expect(hasPositiveEstimatedValue(5800, "1.85")).toBe(true);
    expect(hasPositiveEstimatedValue(5000, "2.00")).toBe(false);
  });

  it("calcule les retours gagné, perdu, annulé et en attente", () => {
    expect(getRealizedReturnCents("WON", 500, "1.85")).toBe(925);
    expect(getRealizedReturnCents("LOST", 500, "1.85")).toBe(0);
    expect(getRealizedReturnCents("VOID", 500, "1.85")).toBe(500);
    expect(getRealizedReturnCents("PENDING", 500, "1.85")).toBeNull();
  });
});

describe("contenu multisport", () => {
  it("accepte un pronostic tennis à deux issues", () => {
    expect(assemblePredictions([prediction()], [])).toHaveLength(1);
  });

  it("accepte un pronostic basket sélectionnant le participant B", () => {
    const basket = prediction({
      id: "basket-1",
      sport: { key: "basketball_nba", title: "NBA" },
      event: { eventId: "basket-event", participantA: "Celtics", participantB: "Knicks" },
      market: {
        key: "h2h",
        outcomes: [
          { name: "Celtics", odds: "1.70" },
          { name: "Knicks", odds: "2.20" },
        ],
      },
      selection: { name: "Knicks" },
      recordedOdds: "2.20",
      reasoning: { ...prediction().reasoning, estimatedProbabilityBps: 4800 },
      source: {
        provider: "betclic-public",
        eventId: "basket-event",
        reference: "https://www.betclic.fr/sport/basket-event",
      },
    });
    expect(assemblePredictions([basket], [
      settlement({
        predictionId: "basket-1",
        status: "LOST",
        result: { winningOutcomeName: "Celtics", scores: null },
        source: {
          provider: "official-source",
          eventId: "basket-event",
          reference: "https://example.test/official/basket-event",
        },
      }),
    ])[0].status).toBe("LOST");
  });

  it("accepte un pronostic football à trois issues et une sélection Draw", () => {
    const football = prediction({
      id: "football-1",
      sport: { key: "soccer_france", title: "Football France" },
      event: { eventId: "football-event", participantA: "Club A", participantB: "Club B" },
      market: {
        key: "h2h",
        outcomes: [
          { name: "Club A", odds: "2.30" },
          { name: "Draw", odds: "3.40" },
          { name: "Club B", odds: "3.00" },
        ],
      },
      selection: { name: "Draw" },
      recordedOdds: "3.40",
      reasoning: { ...prediction().reasoning, estimatedProbabilityBps: 3200 },
      source: {
        provider: "betclic-public",
        eventId: "football-event",
        reference: "https://www.betclic.fr/sport/football-event",
      },
    });
    expect(assemblePredictions([football], [])).toHaveLength(1);
  });

  it("rejette une sélection absente et une cote sélectionnée incohérente", () => {
    expect(() => assemblePredictions([{ ...prediction(), selection: { name: "Inconnue" } }], [])).toThrow(
      "correspondre exactement",
    );
    expect(() => assemblePredictions([{ ...prediction(), recordedOdds: "1.95" }], [])).toThrow(
      "correspondre exactement",
    );
  });

  it("rejette une probabilité invalide et une espérance nulle ou négative", () => {
    expect(() =>
      assemblePredictions(
        [{ ...prediction(), reasoning: { ...prediction().reasoning, estimatedProbabilityBps: 10_000 } }],
        [],
      ),
    ).toThrow("9 999");
    expect(() =>
      assemblePredictions(
        [
          {
            ...prediction(),
            market: { key: "h2h", outcomes: [{ name: "Joueur A", odds: "2.00" }, { name: "Joueur B", odds: "1.80" }] },
            recordedOdds: "2.00",
            reasoning: { ...prediction().reasoning, estimatedProbabilityBps: 5000 },
          },
        ],
        [],
      ),
    ).toThrow("strictement positive");
  });

  it("impose observedAt <= publishedAt < startsAt", () => {
    expect(() =>
      assemblePredictions(
        [
          prediction({
            bookmaker: { ...prediction().bookmaker, observedAt: "2026-01-02T08:01:00Z" },
          }),
        ],
        [],
      ),
    ).toThrow("observation");
    expect(() => assemblePredictions([{ ...prediction(), publishedAt: prediction().startsAt }], [])).toThrow(
      "précéder",
    );
  });

  it("exige une référence publique et un eventId source cohérent", () => {
    expect(() =>
      assemblePredictions(
        [prediction({ source: { ...prediction().source, reference: "" } })],
        [],
      ),
    ).toThrow("chaîne non vide");
    expect(() =>
      assemblePredictions(
        [prediction({ source: { ...prediction().source, reference: "ftp://example.test/event-1" } })],
        [],
      ),
    ).toThrow("URL publique HTTP(S)");
    expect(() =>
      assemblePredictions(
        [prediction({ source: { ...prediction().source, eventId: "another-event" } })],
        [],
      ),
    ).toThrow("correspondre à l’événement");
  });

  it("accepte des règlements gagné, perdu et VOID cohérents", () => {
    expect(assemblePredictions([prediction()], [settlement()])[0].status).toBe("WON");
    const lost = settlement({
      status: "LOST",
      result: { winningOutcomeName: "Joueur B", scores: null },
    });
    expect(assemblePredictions([prediction()], [lost])[0].status).toBe("LOST");
    const voidSettlement = settlement({
      status: "VOID",
      result: { winningOutcomeName: null, scores: null },
    });
    expect(assemblePredictions([prediction()], [voidSettlement])[0].status).toBe("VOID");
  });

  it("rejette un ancien fournisseur et un règlement sans référence publique", () => {
    expect(() =>
      assemblePredictions(
        [
          {
            ...prediction(),
            source: { ...prediction().source, provider: "legacy-provider" },
          },
        ],
        [],
      ),
    ).toThrow("betclic-public est obligatoire");

    expect(() =>
      assemblePredictions(
        [prediction()],
        [
          {
            ...settlement(),
            source: { provider: "betclic-public", eventId: "event-1" },
          },
        ],
      ),
    ).toThrow("chaîne non vide");
  });

  it("rejette les règlements incohérents et VOID avec une issue gagnante", () => {
    expect(() =>
      assemblePredictions(
        [prediction()],
        [settlement({ status: "WON", result: { winningOutcomeName: "Joueur B", scores: null } })],
      ),
    ).toThrow("incohérent");
    expect(() =>
      assemblePredictions(
        [prediction()],
        [settlement({ status: "VOID", result: { winningOutcomeName: "Joueur A", scores: null } })],
      ),
    ).toThrow("VOID exige");
  });

  it("rejette un doublon d’événement mais accepte plusieurs publications le même jour", () => {
    expect(assemblePredictions([sameDayPrediction(0), sameDayPrediction(1)], [])).toHaveLength(2);
    const duplicate = { ...sameDayPrediction(1), event: sameDayPrediction(0).event, source: sameDayPrediction(0).source };
    expect(() => assemblePredictions([sameDayPrediction(0), duplicate], [])).toThrow(
      "Événement publié plusieurs fois",
    );
  });

  it("valide les démonstrations avec des références publiques", () => {
    expect(assemblePredictions(demoPredictions, demoSettlements)).toHaveLength(5);
    expect(demoPredictions.every((item) => item.source.reference.startsWith("https://"))).toBe(true);
  });

  it("trie les jours et événements de manière déterministe", () => {
    const views = assemblePredictions([sameDayPrediction(1), sameDayPrediction(0)], []);
    expect(sortPredictionsNewestFirst(views).map((item) => item.id)).toEqual([
      "prediction-1",
      "prediction-0",
    ]);
    expect(groupPredictionsByPublicationDay(views, "Europe/Paris")[0].predictions.map((item) => item.id)).toEqual([
      "prediction-0",
      "prediction-1",
    ]);
  });
});

describe("statistiques multisports", () => {
  it("retourne des valeurs neutres sans donnée", () => {
    const stats = calculateStatistics([]);
    expect(stats.successRate).toBeNull();
    expect(stats.roi).toBeNull();
    expect(stats.averageEstimatedProbabilityBps).toBeNull();
    expect(stats.averageEstimatedValueBps).toBeNull();
  });

  it("calcule résultats, ROI et estimations moyennes sans les confondre", () => {
    const first = createPredictionView(prediction(), settlement());
    const secondPrediction = sameDayPrediction(1);
    const second = createPredictionView(
      secondPrediction,
      settlement({
        predictionId: secondPrediction.id,
        settledAt: "2026-01-02T23:00:00Z",
        status: "LOST",
        result: { winningOutcomeName: secondPrediction.event.participantB, scores: null },
        source: {
          provider: "betclic-public",
          eventId: secondPrediction.event.eventId,
          reference: `https://www.betclic.fr/sport/${secondPrediction.event.eventId}`,
        },
      }),
    );
    const stats = calculateStatistics([first, second]);
    expect(stats.wonPredictions).toBe(1);
    expect(stats.lostPredictions).toBe(1);
    expect(stats.totalSettledStakeCents).toBe(1000);
    expect(stats.totalRealizedReturnCents).toBe(925);
    expect(stats.netResultCents).toBe(-75);
    expect(stats.roi).toBe(-0.075);
    expect(stats.averageEstimatedProbabilityBps).toBe(5800);
    expect(stats.averageEstimatedValueBps).toBe(730);
  });

  it("ne change pas les statistiques lorsque seule la provenance change", () => {
    const original = prediction();
    const withAnotherReference = prediction({
      source: {
        ...original.source,
        reference: "https://www.betclic.fr/sport/event-1?view=alternate",
      },
    });
    expect(calculateStatistics([createPredictionView(original)])).toEqual(
      calculateStatistics([createPredictionView(withAnotherReference)]),
    );
  });
});

describe("cohérence générique des issues", () => {
  it("compare exactement l’issue gagnante et la sélection", () => {
    expect(getExpectedSettlementStatus("Joueur A", "Joueur A")).toBe("WON");
    expect(getExpectedSettlementStatus("Draw", "Club B")).toBe("LOST");
  });
});
