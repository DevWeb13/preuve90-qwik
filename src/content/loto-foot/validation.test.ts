import { describe, expect, it } from "vitest";
import { calculateVirtualStakeCents } from "./model";
import { getLotoFootPublicationById, loadLotoFootPublications } from "./publications";
import { validateLotoFootPublication } from "./validation";

function createValidPublication(
  id = "lf7-2026-001",
  publishedAt = "2026-07-22T08:00:00Z",
  matchCount = 7,
) {
  return {
    id,
    gridNumber: 1,
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

describe("validation d’une publication Loto Foot 7", () => {
  it("accepte une publication valide à sept matchs", () => {
    expect(validateLotoFootPublication(createValidPublication()).id).toBe("lf7-2026-001");
  });

  it("accepte une publication valide à six matchs", () => {
    expect(
      validateLotoFootPublication(createValidPublication("lf6-2026-001", undefined, 6)).id,
    ).toBe("lf6-2026-001");
  });

  it.each([5, 8])("refuse une publication contenant %i matchs", (matchCount) => {
    expect(() =>
      validateLotoFootPublication(createValidPublication(undefined, undefined, matchCount)),
    ).toThrow(/exactement 6 ou 7 matchs/);
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
    const publication = createValidPublication(undefined, undefined, 6);
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
