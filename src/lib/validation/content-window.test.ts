import { describe, expect, it } from "vitest";
import type { Prediction } from "~/types/prediction";
import { validatePrediction } from "./content";

function predictionWithTiming(observedAt: string, publishedAt: string, startsAt: string): Prediction {
  return {
    id: "prediction-window-test",
    publicationDate: "2026-01-02",
    publishedAt,
    startsAt,
    sport: {
      key: "tennis_atp",
      title: "ATP Test",
    },
    event: {
      eventId: "event-window-test",
      participantA: "Joueur A",
      participantB: "Joueur B",
    },
    market: {
      key: "h2h",
      outcomes: [
        { name: "Joueur A", odds: "1.85" },
        { name: "Joueur B", odds: "1.95" },
      ],
    },
    selection: {
      name: "Joueur A",
    },
    recordedOdds: "1.85",
    bookmaker: {
      key: "betclic_fr",
      name: "Betclic (FR)",
      observedAt,
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
      eventId: "event-window-test",
      reference: "https://www.betclic.fr/sport/event-window-test",
    },
  };
}

describe("fenêtre temporelle des pronostics", () => {
  it("accepte les bornes exactes de 30 minutes et 8 heures", () => {
    expect(
      validatePrediction(
        predictionWithTiming(
          "2026-01-02T08:00:00Z",
          "2026-01-02T08:05:00Z",
          "2026-01-02T08:30:00Z",
        ),
      ).startsAt,
    ).toBe("2026-01-02T08:30:00Z");

    expect(
      validatePrediction(
        predictionWithTiming(
          "2026-01-02T08:00:00Z",
          "2026-01-02T08:05:00Z",
          "2026-01-02T16:00:00Z",
        ),
      ).startsAt,
    ).toBe("2026-01-02T16:00:00Z");
  });

  it("rejette un début situé à moins de 30 minutes de l’observation", () => {
    expect(() =>
      validatePrediction(
        predictionWithTiming(
          "2026-01-02T08:00:00Z",
          "2026-01-02T08:05:00Z",
          "2026-01-02T08:29:59Z",
        ),
      ),
    ).toThrow("au moins 30 minutes");
  });

  it("rejette un début situé à plus de 8 heures de l’observation", () => {
    expect(() =>
      validatePrediction(
        predictionWithTiming(
          "2026-01-02T08:00:00Z",
          "2026-01-02T08:05:00Z",
          "2026-01-02T16:00:01Z",
        ),
      ),
    ).toThrow("8 heures au maximum");
  });
});
