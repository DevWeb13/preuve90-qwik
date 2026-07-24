import { describe, expect, it } from "vitest";
import type { LotoFootFormula, LotoFootPublication, LotoFootResult } from "./model";
import { calculateLotoFootStatistics } from "./statistics";

function createPublication(
  id: string,
  ticketCount: number,
  formula: LotoFootFormula = 7,
): LotoFootPublication {
  return {
    id,
    formula,
    gridNumber: id === "settled" ? 1 : 2,
    officialUrl: "https://example.com/grid",
    validationDeadline: "2026-07-23T18:00:00Z",
    publishedAt: "2026-07-22T08:00:00Z",
    methodVersion: "test",
    matches: Array.from({ length: 6 }, (_, index) => ({ position: index + 1 })),
    tickets: Array.from({ length: ticketCount }, (_, index) => ({
      id: `ticket-${index}`,
      label: `Ticket ${index}`,
      selections: ["1", "1", "1", "1", "1", index === 0 ? "1" : "2"],
    })),
  } as unknown as LotoFootPublication;
}

const result = {
  id: "result",
  publicationId: "settled",
  gridNumber: 1,
  settledAt: "2026-07-24T18:00:00Z",
  officialUrl: "https://example.com/result",
  matches: Array.from({ length: 6 }, (_, index) => ({ position: index + 1, selection: "1" })),
  payouts: [{ correctSelections: 6, amountCents: 500 }],
  sources: [],
} as unknown as LotoFootResult;

describe("statistiques cumulées", () => {
  it("agrège les grilles réglées et en attente sans total stocké", () => {
    const statistics = calculateLotoFootStatistics(
      [createPublication("settled", 2), createPublication("pending", 1)],
      [result],
    );

    expect(statistics).toMatchObject({
      publicationCount: 2,
      settledCount: 1,
      pendingCount: 1,
      ticketCount: 3,
      totalStakeCents: 300,
      settledStakeCents: 200,
      pendingStakeCents: 100,
      settledReturnCents: 500,
      settledNetCents: 300,
      winningTicketCount: 1,
    });
    expect(statistics.settledYieldPercentage).toBe(150);
    expect(statistics.bestSettledGrid?.publication.id).toBe("settled");
  });

  it("ne présente ni perte ni rendement définitif avec uniquement des grilles en attente", () => {
    const statistics = calculateLotoFootStatistics(
      [createPublication("pending-a", 2), createPublication("pending-b", 3)],
      [],
    );

    expect(statistics).toMatchObject({
      publicationCount: 2,
      settledCount: 0,
      pendingCount: 2,
      totalStakeCents: 500,
      settledStakeCents: 0,
      pendingStakeCents: 500,
      settledReturnCents: 0,
      settledNetCents: undefined,
      settledYieldPercentage: undefined,
    });
  });

  it("fonctionne sans publication ni résultat", () => {
    expect(calculateLotoFootStatistics([], [])).toMatchObject({
      publicationCount: 0,
      settledCount: 0,
      pendingCount: 0,
      ticketCount: 0,
      totalStakeCents: 0,
      settledStakeCents: 0,
      pendingStakeCents: 0,
      settledReturnCents: 0,
      settledNetCents: undefined,
      winningTicketCount: 0,
      settledYieldPercentage: undefined,
      bestSettledGrid: undefined,
      settlements: [],
    });
  });

  it("filtre les mêmes agrégats par formule sans modifier le calcul global", () => {
    const lf7 = createPublication("settled", 2, 7);
    const lf15 = createPublication("pending-lf15", 10, 15);
    const publications = [lf7, lf15];

    expect(calculateLotoFootStatistics(publications, [result])).toMatchObject({
      publicationCount: 2,
      ticketCount: 12,
      totalStakeCents: 1_200,
      settledStakeCents: 200,
      pendingStakeCents: 1_000,
      settledReturnCents: 500,
      settledNetCents: 300,
    });
    expect(calculateLotoFootStatistics(publications, [result], 7)).toMatchObject({
      publicationCount: 1,
      settledCount: 1,
      ticketCount: 2,
      totalStakeCents: 200,
      settledStakeCents: 200,
      pendingStakeCents: 0,
      settledReturnCents: 500,
      settledNetCents: 300,
    });
    expect(calculateLotoFootStatistics(publications, [result], 15)).toMatchObject({
      publicationCount: 1,
      settledCount: 0,
      pendingCount: 1,
      ticketCount: 10,
      totalStakeCents: 1_000,
      settledStakeCents: 0,
      pendingStakeCents: 1_000,
      settledReturnCents: 0,
      settledNetCents: undefined,
      settledYieldPercentage: undefined,
    });
  });
});
