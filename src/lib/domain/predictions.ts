import type { Prediction, PredictionView, Settlement } from "~/types/prediction";
import { getDateKeyInTimeZone } from "./calendar";
import { getRealizedReturnCents } from "./money";

export interface PredictionDayGroup {
  dateKey: string;
  predictions: PredictionView[];
}

export function getMatchOutcome(finalScore: Settlement["finalScore"]): Prediction["selection"] {
  if (finalScore.home > finalScore.away) return "HOME";
  if (finalScore.home < finalScore.away) return "AWAY";
  return "DRAW";
}

export function getExpectedSettlementStatus(
  selection: Prediction["selection"],
  finalScore: Settlement["finalScore"],
): "WON" | "LOST" {
  return selection === getMatchOutcome(finalScore) ? "WON" : "LOST";
}

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

export function sortPredictionsByKickoff<T extends Prediction>(predictions: T[]): T[] {
  return [...predictions].sort(
    (left, right) => Date.parse(left.kickoffAt) - Date.parse(right.kickoffAt),
  );
}

export function selectPredictionsForDate(
  predictions: PredictionView[],
  dateKey: string,
  timeZone: string,
): PredictionView[] {
  return sortPredictionsByKickoff(
    predictions.filter(
      (prediction) => getDateKeyInTimeZone(prediction.publishedAt, timeZone) === dateKey,
    ),
  );
}

export function groupPredictionsByPublicationDay(
  predictions: PredictionView[],
  timeZone: string,
): PredictionDayGroup[] {
  const groups = new Map<string, PredictionView[]>();

  for (const prediction of predictions) {
    const dateKey = getDateKeyInTimeZone(prediction.publishedAt, timeZone);
    const group = groups.get(dateKey) ?? [];
    group.push(prediction);
    groups.set(dateKey, group);
  }

  return [...groups.entries()]
    .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
    .map(([dateKey, group]) => ({
      dateKey,
      predictions: sortPredictionsByKickoff(group),
    }));
}
