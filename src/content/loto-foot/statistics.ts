import type { LotoFootPublication, LotoFootResult } from "./model";
import { calculatePublicationSettlement, type LotoFootPublicationSettlement } from "./settlement";

export interface LotoFootStatistics {
  publicationCount: number;
  settledCount: number;
  pendingCount: number;
  ticketCount: number;
  stakeCents: number;
  returnCents: number;
  netCents: number;
  winningTicketCount: number;
  yieldPercentage?: number;
  bestSettledGrid?: LotoFootPublicationSettlement;
  settlements: readonly LotoFootPublicationSettlement[];
}

export function calculateLotoFootStatistics(
  publications: readonly LotoFootPublication[],
  results: readonly LotoFootResult[],
): LotoFootStatistics {
  const resultsByPublicationId = new Map(results.map((result) => [result.publicationId, result]));
  const settlements = publications.map((publication) =>
    calculatePublicationSettlement(publication, resultsByPublicationId.get(publication.id)),
  );
  const settled = settlements.filter(({ status }) => status === "settled");
  const stakeCents = settlements.reduce((total, grid) => total + grid.stakeCents, 0);
  const returnCents = settled.reduce((total, grid) => total + grid.returnCents, 0);
  const netCents = returnCents - stakeCents;
  const bestSettledGrid = settled.reduce<LotoFootPublicationSettlement | undefined>(
    (best, grid) => (!best || grid.netCents > best.netCents ? grid : best),
    undefined,
  );

  return {
    publicationCount: publications.length,
    settledCount: settled.length,
    pendingCount: publications.length - settled.length,
    ticketCount: publications.reduce((total, publication) => total + publication.tickets.length, 0),
    stakeCents,
    returnCents,
    netCents,
    winningTicketCount: settled.reduce(
      (total, grid) =>
        total + grid.ticketSettlements.filter(({ payoutCents }) => payoutCents > 0).length,
      0,
    ),
    yieldPercentage: stakeCents > 0 ? (netCents / stakeCents) * 100 : undefined,
    bestSettledGrid,
    settlements,
  };
}
