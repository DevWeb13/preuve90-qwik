export const LOTO_FOOT_MATCH_COUNT = 7;
export const VIRTUAL_STAKE_PER_TICKET_CENTS = 100;

export const LOTO_FOOT_SELECTIONS = ["1", "N", "2"] as const;

export type LotoFootSelection = (typeof LOTO_FOOT_SELECTIONS)[number];

export type SevenItems<T> = readonly [T, T, T, T, T, T, T];

export interface LotoFootSource {
  label: string;
  url: string;
  accessedAt: string;
}

export interface LotoFootAnalysis {
  summary: string;
  keyFactors: readonly string[];
  uncertainty: string;
  sources: readonly LotoFootSource[];
}

export interface LotoFootProbabilities {
  home: number;
  draw: number;
  away: number;
}

export interface LotoFootMatch {
  position: number;
  homeTeam: string;
  awayTeam: string;
  competition?: string;
  startsAt?: string;
  probabilities: LotoFootProbabilities;
  analysis: LotoFootAnalysis;
}

export interface LotoFootTicket {
  id: string;
  label: string;
  selections: SevenItems<LotoFootSelection>;
  rationale: string;
}

export interface LotoFootPublication {
  id: string;
  gridNumber: number;
  officialUrl: string;
  validationDeadline: string;
  publishedAt: string;
  methodVersion: string;
  matches: SevenItems<LotoFootMatch>;
  tickets: readonly [LotoFootTicket, ...LotoFootTicket[]];
}

export function calculateVirtualStakeCents(ticketCount: number): number {
  if (!Number.isInteger(ticketCount) || ticketCount < 0) {
    throw new Error("Le nombre de combinaisons doit être un entier positif ou nul.");
  }

  return ticketCount * VIRTUAL_STAKE_PER_TICKET_CENTS;
}
