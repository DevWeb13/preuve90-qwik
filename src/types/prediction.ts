export type SettlementStatus = "WON" | "LOST" | "VOID";
export type PredictionStatus = SettlementStatus | "PENDING";

export interface MarketOutcome {
  name: string;
  odds: string;
}

export interface Prediction {
  id: string;
  publicationDate: string;
  publishedAt: string;
  startsAt: string;
  sport: {
    key: string;
    title: string;
  };
  event: {
    eventId: string;
    participantA: string;
    participantB: string;
  };
  market: {
    key: "h2h";
    outcomes: MarketOutcome[];
  };
  selection: {
    name: string;
  };
  recordedOdds: string;
  bookmaker: {
    key: "betclic_fr";
    name: "Betclic (FR)";
    observedAt: string;
  };
  virtualStakeCents: 500;
  reasoning: {
    estimatedProbabilityBps: number;
    summary: string;
    factors: string[];
    uncertainty: string;
  };
  source: {
    provider: "betclic-public";
    eventId: string;
    reference: string;
  };
}

export interface Settlement {
  predictionId: string;
  settledAt: string;
  status: SettlementStatus;
  result: {
    winningOutcomeName: string | null;
    scores: Array<{
      name: string;
      value: string;
    }> | null;
    note?: string;
  };
  source: {
    provider: "betclic-public" | "official-source";
    eventId: string;
    reference: string;
  };
}

export interface PredictionView extends Prediction {
  settlement?: Settlement;
  status: PredictionStatus;
  realizedReturnCents: number | null;
  netResultCents: number | null;
}

export interface CumulativePerformancePoint {
  predictionId: string;
  publicationDate: string;
  netResultCents: number;
}

export interface PredictionStatistics {
  totalPredictions: number;
  settledPredictions: number;
  pendingPredictions: number;
  wonPredictions: number;
  lostPredictions: number;
  voidPredictions: number;
  totalVirtualStakeCents: number;
  totalSettledStakeCents: number;
  totalRealizedReturnCents: number;
  netResultCents: number;
  successRate: number | null;
  roi: number | null;
  averageEstimatedProbabilityBps: number | null;
  averageEstimatedValueBps: number | null;
  daysSinceFirstPublication: number;
  statusDistribution: Record<PredictionStatus, number>;
  cumulativePerformance: CumulativePerformancePoint[];
}

export interface ContentSnapshot {
  predictions: PredictionView[];
  statistics: PredictionStatistics;
  isDemo: boolean;
}

export type ContentResult =
  | { state: "ready"; snapshot: ContentSnapshot }
  | { state: "empty"; snapshot: ContentSnapshot }
  | { state: "error"; message: string };
