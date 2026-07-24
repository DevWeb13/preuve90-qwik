import type { LotoFootFormula, LotoFootPublication, LotoFootResult } from "./model";
import {
  calculatePublicationSettlement,
  type LotoFootPublicationSettlement,
  type LotoFootSettledPublicationSettlement,
} from "./settlement";

export interface LotoFootStatistics {
  publicationCount: number;
  settledCount: number;
  pendingCount: number;
  ticketCount: number;
  totalStakeCents: number;
  settledStakeCents: number;
  pendingStakeCents: number;
  settledReturnCents: number;
  settledNetCents?: number;
  winningTicketCount: number;
  settledYieldPercentage?: number;
  bestSettledGrid?: LotoFootSettledPublicationSettlement;
  settlements: readonly LotoFootPublicationSettlement[];
}

export function calculateLotoFootStatistics(
  publications: readonly LotoFootPublication[],
  results: readonly LotoFootResult[],
  formula?: LotoFootFormula,
): LotoFootStatistics {
  const selectedPublications = formula
    ? publications.filter((publication) => publication.formula === formula)
    : publications;
  const resultsByPublicationId = new Map(results.map((result) => [result.publicationId, result]));
  const settlements = selectedPublications.map((publication) =>
    calculatePublicationSettlement(publication, resultsByPublicationId.get(publication.id)),
  );
  const settled = settlements.filter(
    (settlement): settlement is LotoFootSettledPublicationSettlement =>
      settlement.status === "settled",
  );
  const pending = settlements.filter(({ status }) => status === "pending");
  const totalStakeCents = settlements.reduce((total, grid) => total + grid.stakeCents, 0);
  const settledStakeCents = settled.reduce((total, grid) => total + grid.stakeCents, 0);
  const pendingStakeCents = pending.reduce((total, grid) => total + grid.stakeCents, 0);
  const settledReturnCents = settled.reduce((total, grid) => total + grid.returnCents, 0);
  const settledNetCents = settled.length > 0 ? settledReturnCents - settledStakeCents : undefined;
  const bestSettledGrid = settled.reduce<LotoFootSettledPublicationSettlement | undefined>(
    (best, grid) => (!best || grid.netCents > best.netCents ? grid : best),
    undefined,
  );

  return {
    publicationCount: selectedPublications.length,
    settledCount: settled.length,
    pendingCount: selectedPublications.length - settled.length,
    ticketCount: selectedPublications.reduce(
      (total, publication) => total + publication.tickets.length,
      0,
    ),
    totalStakeCents,
    settledStakeCents,
    pendingStakeCents,
    settledReturnCents,
    settledNetCents,
    winningTicketCount: settled.reduce(
      (total, grid) =>
        total + grid.ticketSettlements.filter(({ payoutCents }) => payoutCents > 0).length,
      0,
    ),
    settledYieldPercentage:
      settledNetCents === undefined || settledStakeCents === 0
        ? undefined
        : (settledNetCents / settledStakeCents) * 100,
    bestSettledGrid,
    settlements,
  };
}
