import { describe, expect, it } from "vitest";
import {
  LOTO_FOOT_MATCH_COUNTS_BY_FORMULA,
  calculateVirtualStakeCents,
  type LotoFootFormula,
} from "./model";
import {
  getLotoFootPublicationById,
  loadLotoFootPublications,
  lotoFootPublications,
} from "./publications";
import { validateLotoFootPublication } from "./validation";

function createValidPublication(
  formula: LotoFootFormula = 7,
  matchCount = LOTO_FOOT_MATCH_COUNTS_BY_FORMULA[formula].at(-1) as number,
  gridNumber = 1,
  publishedAt = "2026-07-22T08:00:00Z",
) {
  return {
    id: `lf${formula}-${gridNumber}-2026-07-23`,
    formula,
    gridNumber,
    officialUrl: "https://example.com/grilles/1",
    validationDeadline: "2026-07-23T18:00:00Z",
    publishedAt,
    methodVersion: "loto-foot-v1",
    matches: Array.from({ length: matchCount }, (_, index) => ({
      position: index + 1,
      homeTeam: `Équipe domicile ${index + 1}`,
      awayTeam: `Équipe extérieure ${index + 1}`,
      competition: "Compétition test",
      startsAt: "2026-07-24T18:00:00Z",
      probabilities: { home: 40, draw: 30, away: 30 },
      analysis: {
        summary: "Résumé sourcé du match.",
        keyFactors: ["Forme récente", "Avantage du terrain"],
        uncertainty: "Composition non confirmée.",
        sources: [
          {
            label: "Source publique",
            url: "https://example.com/source",
            accessedAt: publishedAt,
          },
        ],
      },
    })),
    tickets: [
      {
        id: "principal",
        label: "Choix principal",
        selections: Array.from({ length: matchCount }, (_, index) => ["1", "N", "2"][index % 3]),
        rationale: "Combinaison issue des probabilités les plus fortes.",
      },
    ],
  };
}

describe("validation d’une publication Loto Foot", () => {
  it.each([
    [7, 6],
    [7, 7],
    [8, 7],
    [8, 8],
    [12, 9],
    [12, 10],
    [12, 11],
    [12, 12],
    [15, 12],
    [15, 13],
    [15, 14],
    [15, 15],
  ] as const)("accepte la formule LF%i avec %i matchs", (formula, matchCount) => {
    expect(validateLotoFootPublication(createValidPublication(formula, matchCount)).formula).toBe(
      formula,
    );
  });

  it.each([
    [7, 8],
    [8, 6],
    [12, 8],
    [12, 13],
    [15, 11],
    [15, 16],
  ] as const)("refuse la formule LF%i avec %i matchs", (formula, matchCount) => {
    expect(() => validateLotoFootPublication(createValidPublication(formula, matchCount))).toThrow(
      new RegExp(`formule ${formula}`),
    );
  });

  it("refuse une formule inconnue ou absente", () => {
    const unknownFormula = { ...createValidPublication(), formula: 9 };
    const missingFormula: Record<string, unknown> = { ...createValidPublication() };
    Reflect.deleteProperty(missingFormula, "formula");

    expect(() => validateLotoFootPublication(unknownFormula)).toThrow(/formula.*7, 8, 12 ou 15/);
    expect(() => validateLotoFootPublication(missingFormula)).toThrow(/formula.*7, 8, 12 ou 15/);
  });

  it("refuse un identifiant dont la formule ou le numéro est incohérent", () => {
    const wrongFormula = createValidPublication(12, 12);
    wrongFormula.id = "lf15-1-2026-07-23";
    const wrongGridNumber = createValidPublication();
    wrongGridNumber.id = "lf7-2-2026-07-23";

    expect(() => validateLotoFootPublication(wrongFormula)).toThrow(/préfixe/);
    expect(() => validateLotoFootPublication(wrongGridNumber)).toThrow(/même numéro/);
  });

  it("refuse une position absente", () => {
    const publication = createValidPublication();
    publication.matches[6].position = 8;

    expect(() => validateLotoFootPublication(publication)).toThrow(/position\(s\) 7 absente/);
  });

  it("refuse une position dupliquée", () => {
    const publication = createValidPublication();
    publication.matches[6].position = 6;

    expect(() => validateLotoFootPublication(publication)).toThrow(/dupliquée/);
  });

  it("refuse une somme de probabilités différente de 100", () => {
    const publication = createValidPublication();
    publication.matches[0].probabilities.home = 41;

    expect(() => validateLotoFootPublication(publication)).toThrow(/somme/);
  });

  it("refuse une probabilité hors limites", () => {
    const publication = createValidPublication();
    publication.matches[0].probabilities.home = 101;
    publication.matches[0].probabilities.draw = -31;

    expect(() => validateLotoFootPublication(publication)).toThrow(/compris entre 0 et 100/);
  });

  it("refuse une publication à la date limite ou après celle-ci", () => {
    const publication = createValidPublication();
    publication.publishedAt = publication.validationDeadline;

    expect(() => validateLotoFootPublication(publication)).toThrow(/strictement antérieure/);
  });

  it("refuse une source consultée après la publication", () => {
    const publication = createValidPublication();
    publication.matches[0].analysis.sources[0].accessedAt = "2026-07-22T08:00:01Z";

    expect(() => validateLotoFootPublication(publication)).toThrow(
      /accessedAt.*postérieure à publication\.publishedAt/,
    );
  });

  it("accepte une source consultée exactement à l’heure de publication", () => {
    const publication = createValidPublication();
    publication.matches[0].analysis.sources[0].accessedAt = publication.publishedAt;

    expect(validateLotoFootPublication(publication).id).toBe(publication.id);
  });

  it("conserve la compatibilité avec la valeur methodVersion historique v1", () => {
    const publication = createValidPublication();
    publication.methodVersion = "v1";

    expect(validateLotoFootPublication(publication).methodVersion).toBe("v1");
  });

  it.each(["v2", "foo"])("refuse la valeur methodVersion inconnue %s", (methodVersion) => {
    const publication = createValidPublication();
    publication.methodVersion = methodVersion;

    expect(() => validateLotoFootPublication(publication)).toThrow(
      /methodVersion.*loto-foot-v1 ou v1/,
    );
  });

  it.each([1, 3, 10])("accepte une publication avec %i combinaison(s)", (ticketCount) => {
    const publication = createValidPublication();
    publication.tickets = Array.from({ length: ticketCount }, (_, ticketIndex) => ({
      id: `ticket-${ticketIndex + 1}`,
      label: `Ticket ${ticketIndex + 1}`,
      selections: Array.from({ length: 7 }, (_, selectionIndex) => {
        const divisor = 3 ** selectionIndex;
        return ["1", "N", "2"][Math.floor(ticketIndex / divisor) % 3];
      }),
      rationale: `Scénario distinct ${ticketIndex + 1}.`,
    }));

    expect(validateLotoFootPublication(publication).tickets).toHaveLength(ticketCount);
  });

  it.each([6, 8])(
    "refuse une combinaison contenant %i choix pour sept matchs",
    (selectionCount) => {
      const publication = createValidPublication();
      publication.tickets[0].selections = Array.from({ length: selectionCount }, () => "1");

      expect(() => validateLotoFootPublication(publication)).toThrow(/exactement 7 choix/);
    },
  );

  it("refuse sept choix pour une publication à six matchs", () => {
    const publication = createValidPublication(7, 6);
    publication.tickets[0].selections.push("1");

    expect(() => validateLotoFootPublication(publication)).toThrow(/exactement 6 choix/);
  });

  it("refuse une sélection invalide", () => {
    const publication = createValidPublication();
    publication.tickets[0].selections[3] = "X";

    expect(() => validateLotoFootPublication(publication)).toThrow(/doit valoir 1, N ou 2/);
  });

  it("refuse deux combinaisons identiques", () => {
    const publication = createValidPublication();
    publication.tickets.push({
      ...publication.tickets[0],
      id: "alternative",
    });

    expect(() => validateLotoFootPublication(publication)).toThrow(
      /dupliquer une autre combinaison/,
    );
  });

  it("refuse deux identifiants de combinaison identiques", () => {
    const publication = createValidPublication();
    publication.tickets.push({
      ...publication.tickets[0],
      selections: ["2", "N", "2", "1", "N", "2", "1"],
    });

    expect(() => validateLotoFootPublication(publication)).toThrow(/unique dans la publication/);
  });

  it("refuse des positions valides mais désordonnées", () => {
    const publication = createValidPublication();
    [publication.matches[0], publication.matches[1]] = [
      publication.matches[1],
      publication.matches[0],
    ];

    expect(() => validateLotoFootPublication(publication)).toThrow(/ordonnées exactement/);
  });
});

describe("mise virtuelle", () => {
  it("calcule 100 centimes par combinaison sans plafond", () => {
    expect(calculateVirtualStakeCents(0)).toBe(0);
    expect(calculateVirtualStakeCents(1)).toBe(100);
    expect(calculateVirtualStakeCents(3)).toBe(300);
    expect(calculateVirtualStakeCents(10)).toBe(1_000);
    expect(calculateVirtualStakeCents(10_000)).toBe(1_000_000);
  });
});

describe("chargement des publications", () => {
  it("fonctionne sans publication", () => {
    expect(loadLotoFootPublications({})).toEqual([]);
  });

  it("trie les publications de la plus récente à la plus ancienne et les retrouve par id", () => {
    const older = createValidPublication(7, 7, 1, "2026-07-20T08:00:00Z");
    const newer = createValidPublication(8, 8, 2, "2026-07-22T08:00:00Z");
    const publications = loadLotoFootPublications({
      [`./publications/${older.id}.json`]: older,
      [`./publications/${newer.id}.json`]: newer,
    });

    expect(publications.map(({ id }) => id)).toEqual([newer.id, older.id]);
    expect(getLotoFootPublicationById(older.id, publications)).toMatchObject({ id: older.id });
    expect(getLotoFootPublicationById("inconnue", publications)).toBeUndefined();
  });

  it("normalise uniquement au chargement une publication historique lf7 sans formule", () => {
    const historicalPublication: Record<string, unknown> = { ...createValidPublication() };
    Reflect.deleteProperty(historicalPublication, "formula");
    const publications = loadLotoFootPublications({
      [`./publications/${String(historicalPublication.id)}.json`]: historicalPublication,
    });

    expect(publications[0].formula).toBe(7);
    expect(() => validateLotoFootPublication(historicalPublication)).toThrow(/formula/);
  });

  it("refuse un nom de fichier incohérent", () => {
    expect(() =>
      loadLotoFootPublications({
        "./publications/lf7-2-2026-07-23.json": createValidPublication(),
      }),
    ).toThrow(/nom du fichier/);
  });

  it("refuse un doublon formule + numéro mais accepte le même numéro sur deux formules", () => {
    const lf7 = createValidPublication(7, 7, 3);
    const duplicateLf7 = {
      ...createValidPublication(7, 6, 3),
      id: "lf7-3-2026-07-24",
    };
    const lf15 = createValidPublication(15, 15, 3);

    expect(() =>
      loadLotoFootPublications({
        [`./publications/${lf7.id}.json`]: lf7,
        [`./publications/${duplicateLf7.id}.json`]: duplicateLf7,
      }),
    ).toThrow(/Loto Foot 7 n°3 dupliquée/);
    expect(
      loadLotoFootPublications({
        [`./publications/${lf7.id}.json`]: lf7,
        [`./publications/${lf15.id}.json`]: lf15,
      }),
    ).toHaveLength(2);
  });

  it("conserve les publications historiques 91 et 92 sans modifier leurs JSON", () => {
    expect(lotoFootPublications.map(({ id, formula }) => ({ id, formula }))).toEqual([
      { id: "lf7-92-2026-07-24", formula: 7 },
      { id: "lf7-91-2026-07-22", formula: 7 },
    ]);
  });
});
