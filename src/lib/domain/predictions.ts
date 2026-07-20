import type { Prediction, PredictionView, Settlement } from "~/types/prediction";
import { getRealizedReturnCents } from "./money";

export function createPredictionView(
  prediction: Prediction,
  settlement?: Settlement,
): PredictionView {
  const status = settlement?.status ?? "PENDING";
  const realizedReturnCents = getRealizedReturnCents(
    status,
    prediction.virtualStakeCents,
    prediction.recordedOdds,
  );

  return {
    ...prediction,
    settlement,
    status,
    realizedReturnCents,
    netResultCents:
      realizedReturnCents === null ? null : realizedReturnCents - prediction.virtualStakeCents,
  };
}

export function sortPredictionsNewestFirst<T extends Prediction>(predictions: T[]): T[] {
  return [...predictions].sort(
    (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
  );
}
