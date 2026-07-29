import { describe, expect, it } from "vitest";
import {
  cachedMatchFromFixture,
  findFixture,
  fixtureDatesForMatch,
  isApiDateUnavailableError,
  normalizeTeamName,
  teamSimilarity,
} from "./settle-loto-foot.mjs";

function fixture(
  home: string,
  away: string,
  date = "2026-07-27T19:00:00+02:00",
  status = "FT",
) {
  return {
    fixture: { id: 123, date, status: { short: status } },
    teams: { home: { name: home }, away: { name: away } },
    score: { fulltime: { home: 1, away: 0 } },
  };
}

describe("rapprochement des rencontres API-Football", () => {
  it.each([
    ["AIK Solna", "AIK Stockholm"],
    ["Hearts", "Heart of Midlothian"],
    ["KS Egnatia", "Egnatia Rrogozhine"],
    ["Etoile Rouge", "Crvena Zvezda"],
    ["Uni.Craiova", "Universitatea Craiova"],
    ["Aarhus GF", "AGF Aarhus"],
    ["Zhytomyr", "Polissya Zhytomyr"],
  ])("reconnaît %s et %s comme la même équipe", (left, right) => {
    expect(teamSimilarity(left, right)).toBeGreaterThanOrEqual(0.94);
  });

  it("résout une rencontre malgré les noms différents", () => {
    const match = {
      homeTeam: "Häcken",
      awayTeam: "AIK Solna",
      startsAt: "2026-07-27T19:00:00+02:00",
    };

    expect(findFixture(match, [fixture("BK Hacken", "AIK Stockholm")])).toBeDefined();
  });

  it("cherche plusieurs jours uniquement pour une publication historique", () => {
    expect(fixtureDatesForMatch({}, "2026-07-28T18:55:00+02:00")).toEqual([
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
    ]);
    expect(
      fixtureDatesForMatch(
        { startsAt: "2026-07-30T20:00:00+02:00" },
        "2026-07-28T18:55:00+02:00",
      ),
    ).toEqual(["2026-07-30"]);
  });

  it("normalise les noms sans dépendre des préfixes de club", () => {
    expect(normalizeTeamName("KS Egnatia")).toBe("egnatia");
    expect(normalizeTeamName("Heart of Midlothian FC")).toBe("heart midlothian");
  });
});

describe("conservation des scores", () => {
  it("conserve le score final et la sélection 1N2", () => {
    const match = { position: 3 };
    expect(
      cachedMatchFromFixture(
        match,
        fixture("Häcken", "AIK"),
        "2026-07-29T11:30:00+02:00",
      ),
    ).toEqual({
      position: 3,
      selection: "1",
      homeScore: 1,
      awayScore: 0,
      fixtureId: 123,
      fixtureDate: "2026-07-27T19:00:00+02:00",
      capturedAt: "2026-07-29T11:30:00+02:00",
    });
  });

  it("n’enregistre pas une rencontre non terminée", () => {
    expect(
      cachedMatchFromFixture({ position: 1 }, fixture("A", "B", undefined, "NS")),
    ).toBeUndefined();
  });

  it("reconnaît la limite de dates du forfait gratuit sans masquer les autres erreurs", () => {
    expect(
      isApiDateUnavailableError(
        new Error(
          'API-Football : {"plan":"Free plans do not have access to this date, try from 2026-07-28 to 2026-07-30."}',
        ),
      ),
    ).toBe(true);
    expect(isApiDateUnavailableError(new Error("API-Football a répondu 500"))).toBe(false);
  });
});
