import { describe, expect, it } from "vitest";
import {
  findFixture,
  fixtureDatesForMatch,
  normalizeTeamName,
  teamSimilarity,
} from "./settle-loto-foot.mjs";

function fixture(home: string, away: string, date = "2026-07-27T19:00:00+02:00") {
  return {
    fixture: { date, status: { short: "FT" } },
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
