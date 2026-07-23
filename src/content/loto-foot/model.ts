export const LOTO_FOOT_FORMULAS = [7, 8, 12, 15] as const;
export type LotoFootFormula = (typeof LOTO_FOOT_FORMULAS)[number];

export const LOTO_FOOT_MATCH_COUNTS_BY_FORMULA = {
  7: [6, 7],
  8: [7, 8],
  12: [9, 10, 11, 12],
  15: [12, 13, 14, 15],
} as const satisfies Record<LotoFootFormula, readonly number[]>;

export const VIRTUAL_STAKE_PER_TICKET_CENTS = 100;

export const LOTO_FOOT_SELECTIONS = ["1", "N", "2"] as const;

export type LotoFootSelection = (typeof LOTO_FOOT_SELECTIONS)[number];

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
  selections: readonly LotoFootSelection[];
  rationale: string;
}

export interface LotoFootPublication {
  id: string;
  formula: LotoFootFormula;
  gridNumber: number;
  officialUrl: string;
  validationDeadline: string;
  publishedAt: string;
  methodVersion: string;
  matches: readonly LotoFootMatch[];
  tickets: readonly [LotoFootTicket, ...LotoFootTicket[]];
}

export type LotoFootOfficialMatchResult = {
  position: number;
  selection: LotoFootSelection;
} & ({ homeScore: number; awayScore: number } | { homeScore?: never; awayScore?: never });

export interface LotoFootOfficialPayout {
  correctSelections: number;
  amountCents: number;
}

export interface LotoFootResult {
  id: string;
  publicationId: string;
  gridNumber: number;
  settledAt: string;
  officialUrl: string;
  matches: readonly LotoFootOfficialMatchResult[];
  payouts: readonly [LotoFootOfficialPayout, ...LotoFootOfficialPayout[]];
  sources: readonly [LotoFootSource, ...LotoFootSource[]];
}

export function calculateVirtualStakeCents(ticketCount: number): number {
  if (!Number.isInteger(ticketCount) || ticketCount < 0) {
    throw new Error("Le nombre de combinaisons doit être un entier positif ou nul.");
  }

  return ticketCount * VIRTUAL_STAKE_PER_TICKET_CENTS;
}
