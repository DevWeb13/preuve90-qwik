import { describe, expect, it } from "vitest";
import type { LotoFootFormula } from "./model";
import { validateLotoFootPublication } from "./validation";
import { validateLotoFootResult } from "./result-validation";
import { getLotoFootResultByPublicationId, loadLotoFootResults, lotoFootResults } from "./results";

function createPublication(matchCount = 7, formula: LotoFootFormula = 7, gridNumber = 42) {
  return validateLotoFootPublication({
    id: `lf${formula}-${gridNumber}-2026-07-23`,
    formula,
    gridNumber,
    officialUrl: "https://example.com/grid/42",
    validationDeadline: "2026-07-23T18:00:00Z",
    publishedAt: "2026-07-22T08:00:00Z",
    methodVersion: "loto-foot-v1",
    matches: Array.from({ length: matchCount }, (_, index) => ({
      position: index + 1,
      homeTeam: `Domicile ${index + 1}`,
      awayTeam: `Extérieur ${index + 1}`,
      probabilities: { home: 40, draw: 30, away: 30 },
      analysis: {
        summary: "Résumé",
        keyFactors: ["Facteur"],
        uncertainty: "Incertitude",
        sources: [
          {
            label: "Source",
            url: "https://example.com/source",
            accessedAt: "2026-07-22T07:00:00Z",
          },
        ],
      },
    })),
    tickets: [
      {
        id: "ticket-1",
        label: "Ticket 1",
        selections: Array.from({ length: matchCount }, () => "1"),
        rationale: "Test",
      },
    ],
  });
}

function createResult(matchCount = 7, formula: LotoFootFormula = 7, gridNumber = 42) {
  const publicationId = `lf${formula}-${gridNumber}-2026-07-23`;
  return {
    id: `${publicationId}-result`,
    publicationId,
    gridNumber,
    settledAt: "2026-07-24T18:00:00Z",
    officialUrl: "https://example.com/results/42",
    matches: Array.from({ length: matchCount }, (_, index) => {
      const selection = ["1", "N", "2"][index % 3];
      const [homeScore, awayScore] =
        selection === "1" ? [2, 1] : selection === "N" ? [1, 1] : [0, 1];

      return { position: index + 1, selection, homeScore, awayScore };
    }),
    payouts: [
      { correctSelections: matchCount, amountCents: 12_500 },
      { correctSelections: matchCount - 1, amountCents: 900 },
    ],
    sources: [
      {
        label: "FDJ — rapport officiel",
        url: "https://example.com/results/42/report",
        accessedAt: "2026-07-24T19:00:00Z",
      },
    ],
  };
}

describe("validation d’un résultat Loto Foot", () => {
  it.each([
    [7, 6],
    [7, 7],
    [8, 8],
    [12, 12],
    [15, 15],
  ] as const)("accepte un résultat LF%i complet à %i matchs", (formula, matchCount) => {
    const publication = createPublication(matchCount, formula);
    expect(
      validateLotoFootResult(createResult(matchCount, formula), [publication]).publicationId,
    ).toBe(publication.id);
  });

  it("refuse un résultat orphelin", () => {
    expect(() => validateLotoFootResult(createResult(), [])).toThrow(/aucune publication/);
  });

  it("refuse un numéro de grille incohérent", () => {
    const result = createResult();
    result.gridNumber = 43;
    expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(/numéro/);
  });

  it("refuse une longueur incohérente", () => {
    const result = createResult();
    result.matches.pop();
    expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(
      /exactement 7 résultats/,
    );
  });

  it("refuse les positions absentes, dupliquées, désordonnées ou hors limites", () => {
    const result = createResult();
    result.matches[1].position = 1;
    expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(
      /uniques et ordonnées/,
    );
  });

  it("refuse une sélection invalide", () => {
    const result = createResult();
    result.matches[0].selection = "X";
    expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(/1, N ou 2/);
  });

  it("refuse un score unique, négatif ou non entier", () => {
    const missingScore = createResult();
    Reflect.deleteProperty(missingScore.matches[0], "awayScore");
    expect(() => validateLotoFootResult(missingScore, [createPublication()])).toThrow(
      /deux scores/,
    );

    const negativeScore = createResult();
    negativeScore.matches[0].homeScore = -1;
    expect(() => validateLotoFootResult(negativeScore, [createPublication()])).toThrow(
      /positif ou nul/,
    );

    const decimalScore = createResult();
    decimalScore.matches[0].homeScore = 1.5;
    expect(() => validateLotoFootResult(decimalScore, [createPublication()])).toThrow(/entier/);
  });

  it.each([
    ["1", 2, 1],
    ["N", 1, 1],
    ["2", 0, 1],
  ])("accepte la sélection %s cohérente avec le score %i-%i", (selection, homeScore, awayScore) => {
    const result = createResult();
    result.matches[0] = { position: 1, selection, homeScore, awayScore };

    expect(validateLotoFootResult(result, [createPublication()]).matches[0].selection).toBe(
      selection,
    );
  });

  it.each([
    ["N", 2, 1, "1"],
    ["2", 1, 1, "N"],
    ["1", 0, 1, "2"],
  ])(
    "refuse la sélection %s contradictoire avec le score %i-%i",
    (selection, homeScore, awayScore, expectedSelection) => {
      const result = createResult();
      result.matches[0] = { position: 1, selection, homeScore, awayScore };

      expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(
        new RegExp(`doit valoir ${expectedSelection} pour correspondre au score`),
      );
    },
  );

  it("refuse un règlement antérieur à la clôture", () => {
    const result = createResult();
    result.settledAt = "2026-07-23T17:59:59Z";
    expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(/antérieur/);
  });

  it("refuse une date de règlement invalide", () => {
    const result = createResult();
    result.settledAt = "date-invalide";
    expect(() => validateLotoFootResult(result, [createPublication()])).toThrow(
      /date et heure valides/,
    );
  });

  it("refuse les rapports dupliqués, hors limites ou avec montant invalide", () => {
    const duplicate = createResult();
    duplicate.payouts[1].correctSelections = 7;
    expect(() => validateLotoFootResult(duplicate, [createPublication()])).toThrow(/unique/);

    const outOfRange = createResult();
    outOfRange.payouts[0].correctSelections = 8;
    expect(() => validateLotoFootResult(outOfRange, [createPublication()])).toThrow(/dépasser 7/);

    const invalidAmount = createResult();
    invalidAmount.payouts[0].amountCents = -1;
    expect(() => validateLotoFootResult(invalidAmount, [createPublication()])).toThrow(
      /positif ou nul/,
    );
  });

  it("refuse une URL ou une source invalide", () => {
    const invalidUrl = createResult();
    invalidUrl.officialUrl = "ftp://example.com/result";
    expect(() => validateLotoFootResult(invalidUrl, [createPublication()])).toThrow(/HTTP/);

    const missingSources = createResult();
    missingSources.sources = [];
    expect(() => validateLotoFootResult(missingSources, [createPublication()])).toThrow(
      /source officielle/,
    );
  });
});

describe("chargement Edge compatible des résultats", () => {
  it("fonctionne sans aucun fichier de résultat", () => {
    expect(loadLotoFootResults({}, [createPublication()])).toEqual([]);
  });

  it("refuse les identifiants et publications dupliqués", () => {
    const publication = createPublication();
    const result = createResult();
    expect(() =>
      loadLotoFootResults(
        {
          [`./results/${publication.id}.json`]: result,
          [`./other/${publication.id}.json`]: result,
        },
        [publication],
      ),
    ).toThrow(/Identifiant.*dupliqué/);

    const alternateResult = { ...result, id: "autre-resultat" };
    expect(() =>
      loadLotoFootResults(
        {
          [`./results/${publication.id}.json`]: result,
          [`./other/${publication.id}.json`]: alternateResult,
        },
        [publication],
      ),
    ).toThrow(/Plusieurs résultats/);
  });

  it("retrouve un résultat par publication", () => {
    const publication = createPublication();
    const results = loadLotoFootResults({ [`./results/${publication.id}.json`]: createResult() }, [
      publication,
    ]);
    expect(getLotoFootResultByPublicationId(publication.id, results)?.id).toBe(
      `${publication.id}-result`,
    );
  });

  it("refuse un résultat dont le nom de fichier ne correspond pas à la publication", () => {
    const publication = createPublication();

    expect(() =>
      loadLotoFootResults({ "./results/lf7-43-2026-07-23.json": createResult() }, [publication]),
    ).toThrow(/nom du fichier/);
  });

  it("conserve le résultat historique de la publication 91", () => {
    expect(lotoFootResults).toHaveLength(1);
    expect(lotoFootResults[0]).toMatchObject({
      publicationId: "lf7-91-2026-07-22",
      gridNumber: 91,
    });
  });
});
