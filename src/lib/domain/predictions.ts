import type { Prediction, PredictionView, Settlement } from "~/types/prediction";
import { getDateKeyInTimeZone } from "./calendar";
import { getRealizedReturnCents } from "./money";

export interface PredictionDayGroup {
  dateKey: string;
  predictions: PredictionView[];
}

export function getExpectedSettlementStatus(
  selectionName: string,
  winningOutcomeName: string,
): "WON" | "LOST" {
  return selectionName === winningOutcomeName ? "WON" : "LOST";
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

export function sortPredictionsByStart<T extends Prediction>(predictions: T[]): T[] {
  return [...predictions].sort(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt),
  );
}

export function selectPredictionsForDate(
  predictions: PredictionView[],
  dateKey: string,
  timeZone: string,
): PredictionView[] {
  return sortPredictionsByStart(
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
      predictions: sortPredictionsByStart(group),
    }));
}
