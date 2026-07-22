import { describe, expect, it } from "vitest";
import { calculateVirtualStakeCents } from "./model";
import { getLotoFootPublicationById, loadLotoFootPublications } from "./publications";
import { validateLotoFootPublication } from "./validation";

function createValidPublication(id = "lf7-2026-001", publishedAt = "2026-07-22T08:00:00Z") {
  return {
    id,
    gridNumber: 1,
    officialUrl: "https://example.com/grilles/1",
    validationDeadline: "2026-07-23T18:00:00Z",
    publishedAt,
    methodVersion: "1.0.0",
    matches: Array.from({ length: 7 }, (_, index) => ({
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
            accessedAt: "2026-07-22T07:00:00Z",
          },
        ],
      },
    })),
    tickets: [
      {
        id: "principal",
        label: "Choix principal",
        selections: ["1", "N", "2", "1", "N", "2", "1"],
        rationale: "Combinaison issue des probabilités les plus fortes.",
      },
    ],
  };
}

describe("validation d’une publication Loto Foot 7", () => {
  it("accepte une publication valide", () => {
    expect(validateLotoFootPublication(createValidPublication()).id).toBe("lf7-2026-001");
  });

  it("refuse un nombre de matchs différent de 7", () => {
    const publication = createValidPublication();
    publication.matches.pop();

    expect(() => validateLotoFootPublication(publication)).toThrow(/exactement 7 matchs/);
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

  it.each([6, 8])("refuse une combinaison contenant %i choix", (selectionCount) => {
    const publication = createValidPublication();
    publication.tickets[0].selections = Array.from({ length: selectionCount }, () => "1");

    expect(() => validateLotoFootPublication(publication)).toThrow(/exactement 7 choix/);
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
});

describe("mise virtuelle", () => {
  it("calcule 100 centimes par combinaison sans plafond", () => {
    expect(calculateVirtualStakeCents(0)).toBe(0);
    expect(calculateVirtualStakeCents(3)).toBe(300);
    expect(calculateVirtualStakeCents(10_000)).toBe(1_000_000);
  });
});

describe("chargement des publications", () => {
  it("fonctionne sans publication", () => {
    expect(loadLotoFootPublications({})).toEqual([]);
  });

  it("trie les publications de la plus récente à la plus ancienne et les retrouve par id", () => {
    const older = createValidPublication("ancienne", "2026-07-20T08:00:00Z");
    const newer = createValidPublication("recente", "2026-07-22T08:00:00Z");
    const publications = loadLotoFootPublications({
      "./publications/ancienne.json": older,
      "./publications/recente.json": newer,
    });

    expect(publications.map(({ id }) => id)).toEqual(["recente", "ancienne"]);
    expect(getLotoFootPublicationById("ancienne", publications)).toMatchObject({ id: "ancienne" });
    expect(getLotoFootPublicationById("inconnue", publications)).toBeUndefined();
  });
});
