import { describe, expect, it } from "vitest";
import { validateLotoFootPublication } from "./validation";
import { validateLotoFootResult } from "./result-validation";
import { getLotoFootResultByPublicationId, loadLotoFootResults } from "./results";

function createPublication(matchCount = 7) {
  return validateLotoFootPublication({
    id: `publication-${matchCount}`,
    gridNumber: 42,
    officialUrl: "https://example.com/grid/42",
    validationDeadline: "2026-07-23T18:00:00Z",
    publishedAt: "2026-07-22T08:00:00Z",
    methodVersion: "test",
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

function createResult(matchCount = 7) {
  return {
    id: `result-${matchCount}`,
    publicationId: `publication-${matchCount}`,
    gridNumber: 42,
    settledAt: "2026-07-24T18:00:00Z",
    officialUrl: "https://example.com/results/42",
    matches: Array.from({ length: matchCount }, (_, index) => ({
      position: index + 1,
      selection: ["1", "N", "2"][index % 3],
      homeScore: index,
      awayScore: 0,
    })),
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
  it.each([6, 7])("accepte un résultat complet à %i matchs", (matchCount) => {
    const publication = createPublication(matchCount);
    expect(validateLotoFootResult(createResult(matchCount), [publication]).publicationId).toBe(
      publication.id,
    );
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
      loadLotoFootResults({ "./results/a.json": result, "./results/b.json": result }, [
        publication,
      ]),
    ).toThrow(/Identifiant.*dupliqué/);

    expect(() =>
      loadLotoFootResults(
        {
          "./results/a.json": result,
          "./results/b.json": { ...result, id: "autre-resultat" },
        },
        [publication],
      ),
    ).toThrow(/Plusieurs résultats/);
  });

  it("retrouve un résultat par publication", () => {
    const publication = createPublication();
    const results = loadLotoFootResults({ "./results/result.json": createResult() }, [publication]);
    expect(getLotoFootResultByPublicationId(publication.id, results)?.id).toBe("result-7");
  });
});
