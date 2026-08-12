import { describe, expect, it } from "vitest";
import {
  LOTO_FOOT_NEUTRALIZED_SELECTION,
  type LotoFootPublication,
  type LotoFootResult,
} from "./model";
import { validateLotoFootResult } from "./result-validation";
import { countCorrectSelections } from "./settlement";
import {
  getMatchVerdictLabel,
  getSelectionPresentation,
} from "~/lib/formatting/loto-foot-presentation";

const publication = {
  id: "lf7-999-2026-08-12",
  formula: 7,
  gridNumber: 999,
  officialUrl: "https://example.com/grid",
  validationDeadline: "2026-08-12T18:00:00Z",
  publishedAt: "2026-08-12T08:00:00Z",
  methodVersion: "loto-foot-v1",
  matches: Array.from({ length: 6 }, (_, index) => ({ position: index + 1 })),
  tickets: [
    {
      id: "ticket-a",
      label: "A",
      selections: ["1", "N", "2", "1", "N", "2"],
      rationale: "Test",
    },
    {
      id: "ticket-b",
      label: "B",
      selections: ["2", "2", "2", "1", "N", "2"],
      rationale: "Test",
    },
  ],
} as unknown as LotoFootPublication;

function createResult(): LotoFootResult {
  return {
    id: "lf7-999-2026-08-12-result",
    publicationId: publication.id,
    gridNumber: publication.gridNumber,
    settledAt: "2026-08-13T18:00:00Z",
    officialUrl: "https://example.com/result",
    matches: [
      { position: 1, selection: "1" },
      { position: 2, selection: LOTO_FOOT_NEUTRALIZED_SELECTION },
      { position: 3, selection: "2" },
      { position: 4, selection: "1" },
      { position: 5, selection: "N" },
      { position: 6, selection: "2" },
    ],
    payouts: [{ correctSelections: 6, amountCents: 1_000 }],
    sources: [
      {
        label: "FDJ - résultat officiel",
        url: "https://example.com/result",
        accessedAt: "2026-08-13T18:00:00Z",
      },
    ],
  };
}

describe("rencontres Loto Foot neutralisées", () => {
  it("valide G comme résultat officiel sans score", () => {
    expect(validateLotoFootResult(createResult(), [publication]).matches[1].selection).toBe("G");
  });

  it("refuse un score sportif sur une rencontre neutralisée", () => {
    const result = createResult() as unknown as {
      matches: Array<Record<string, unknown>>;
    };
    result.matches[1] = { position: 2, selection: "G", homeScore: 0, awayScore: 0 };

    expect(() => validateLotoFootResult(result, [publication])).toThrow(/neutralisée/);
  });

  it("compte la rencontre neutralisée comme correcte quel que soit le choix publié", () => {
    const result = createResult();
    expect(countCorrectSelections(publication.tickets[0], result)).toBe(6);
    expect(countCorrectSelections(publication.tickets[1], result)).toBe(5);
  });

  it("présente le choix publié comme gagnant sans inventer de résultat 1/N/2", () => {
    expect(getSelectionPresentation("2", "2", "G")).toEqual({
      isSelected: true,
      isOfficial: false,
      verdict: "correct",
    });
    expect(getMatchVerdictLabel("2", "G")).toBe(
      "Rencontre neutralisée : choix réputé gagnant",
    );
  });
});
