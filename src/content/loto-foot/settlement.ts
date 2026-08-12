import {
  LOTO_FOOT_NEUTRALIZED_SELECTION,
  calculateVirtualStakeCents,
  type LotoFootPublication,
  type LotoFootResult,
  type LotoFootTicket,
} from "./model";

export interface LotoFootTicketSettlement {
  ticket: LotoFootTicket;
  correctSelections: number;
  payoutCents: number;
}

interface LotoFootPublicationSettlementBase {
  publication: LotoFootPublication;
  stakeCents: number;
}

export interface LotoFootPendingPublicationSettlement extends LotoFootPublicationSettlementBase {
  result?: undefined;
  status: "pending";
  ticketSettlements: readonly [];
  returnCents?: undefined;
  netCents?: undefined;
}

export interface LotoFootSettledPublicationSettlement extends LotoFootPublicationSettlementBase {
  result: LotoFootResult;
  status: "settled";
  ticketSettlements: readonly LotoFootTicketSettlement[];
  returnCents: number;
  netCents: number;
}

export type LotoFootPublicationSettlement =
  | LotoFootPendingPublicationSettlement
  | LotoFootSettledPublicationSettlement;

export function countCorrectSelections(ticket: LotoFootTicket, result: LotoFootResult): number {
  if (ticket.selections.length !== result.matches.length) {
    throw new Error("La combinaison et le résultat doivent contenir le même nombre de matchs.");
  }
  return ticket.selections.reduce((total, selection, index) => {
    const officialSelection = result.matches[index].selection;
    return (
      total +
      Number(
        officialSelection === LOTO_FOOT_NEUTRALIZED_SELECTION ||
          selection === officialSelection,
      )
    );
  }, 0);
}

export function findPayoutCents(result: LotoFootResult, correctSelections: number): number {
  return (
    result.payouts.find((payout) => payout.correctSelections === correctSelections)?.amountCents ??
    0
  );
}

export function calculateTicketSettlement(
  ticket: LotoFootTicket,
  result: LotoFootResult,
): LotoFootTicketSettlement {
  const correctSelections = countCorrectSelections(ticket, result);
  return {
    ticket,
    correctSelections,
    payoutCents: findPayoutCents(result, correctSelections),
  };
}

export function getPublicationStatus(result?: LotoFootResult): "pending" | "settled" {
  return result ? "settled" : "pending";
}

export function calculatePublicationStakeCents(publication: LotoFootPublication): number {
  return calculateVirtualStakeCents(publication.tickets.length);
}

export function calculatePublicationReturnCents(
  publication: LotoFootPublication,
  result?: LotoFootResult,
): number | undefined {
  if (!result) return undefined;
  return publication.tickets.reduce(
    (total, ticket) => total + calculateTicketSettlement(ticket, result).payoutCents,
    0,
  );
}

export function calculatePublicationNetCents(
  publication: LotoFootPublication,
  result?: LotoFootResult,
): number | undefined {
  const returnCents = calculatePublicationReturnCents(publication, result);
  return returnCents === undefined
    ? undefined
    : returnCents - calculatePublicationStakeCents(publication);
}

export function calculatePublicationSettlement(
  publication: LotoFootPublication,
  result?: LotoFootResult,
): LotoFootPublicationSettlement {
  if (result && result.publicationId !== publication.id) {
    throw new Error("Le résultat ne correspond pas à la publication.");
  }

  const stakeCents = calculatePublicationStakeCents(publication);
  if (!result) {
    return {
      publication,
      status: "pending",
      ticketSettlements: [],
      stakeCents,
    };
  }

  const ticketSettlements = publication.tickets.map((ticket) =>
    calculateTicketSettlement(ticket, result),
  );
  const returnCents = ticketSettlements.reduce((total, ticket) => total + ticket.payoutCents, 0);

  return {
    publication,
    result,
    status: "settled",
    ticketSettlements,
    stakeCents,
    returnCents,
    netCents: returnCents - stakeCents,
  };
}
