import { describe, expect, it } from "vitest";
import type { LotoFootPublication, LotoFootResult } from "./model";
import {
  calculatePublicationSettlement,
  calculatePublicationNetCents,
  calculatePublicationReturnCents,
  calculatePublicationStakeCents,
  calculateTicketSettlement,
  countCorrectSelections,
  findPayoutCents,
  getPublicationStatus,
} from "./settlement";

const publication = {
  id: "publication",
  gridNumber: 1,
  officialUrl: "https://example.com/grid",
  validationDeadline: "2026-07-23T18:00:00Z",
  publishedAt: "2026-07-22T08:00:00Z",
  methodVersion: "test",
  matches: Array.from({ length: 6 }, (_, index) => ({ position: index + 1 })),
  tickets: [
    { id: "a", label: "A", selections: ["1", "N", "2", "1", "N", "2"] },
    { id: "b", label: "B", selections: ["1", "1", "2", "2", "N", "2"] },
  ],
} as unknown as LotoFootPublication;

const result = {
  id: "result",
  publicationId: "publication",
  gridNumber: 1,
  settledAt: "2026-07-24T18:00:00Z",
  officialUrl: "https://example.com/result",
  matches: ["1", "N", "2", "1", "N", "2"].map((selection, index) => ({
    position: index + 1,
    selection,
  })),
  payouts: [
    { correctSelections: 6, amountCents: 1_000 },
    { correctSelections: 4, amountCents: 200 },
  ],
  sources: [],
} as unknown as LotoFootResult;

describe("calcul du règlement", () => {
  it("compte les bons choix", () => {
    expect(countCorrectSelections(publication.tickets[0], result)).toBe(6);
    expect(countCorrectSelections(publication.tickets[1], result)).toBe(4);
  });

  it("associe le rapport officiel ou zéro", () => {
    expect(findPayoutCents(result, 6)).toBe(1_000);
    expect(findPayoutCents(result, 5)).toBe(0);
    expect(calculateTicketSettlement(publication.tickets[1], result).payoutCents).toBe(200);
  });

  it("calcule la mise, le retour, le résultat net et le statut", () => {
    expect(calculatePublicationStakeCents(publication)).toBe(200);
    expect(calculatePublicationReturnCents(publication, result)).toBe(1_200);
    expect(calculatePublicationNetCents(publication, result)).toBe(1_000);
    expect(calculatePublicationReturnCents(publication)).toBeUndefined();
    expect(calculatePublicationNetCents(publication)).toBeUndefined();
    expect(getPublicationStatus()).toBe("pending");
    expect(getPublicationStatus(result)).toBe("settled");
    expect(calculatePublicationSettlement(publication, result)).toMatchObject({
      status: "settled",
      stakeCents: 200,
      returnCents: 1_200,
      netCents: 1_000,
    });
    expect(calculatePublicationSettlement(publication)).toMatchObject({
      status: "pending",
      stakeCents: 200,
    });
    expect(calculatePublicationSettlement(publication)).not.toHaveProperty("returnCents");
    expect(calculatePublicationSettlement(publication)).not.toHaveProperty("netCents");
  });
});
