import type { PredictionStatistics, PredictionView } from "~/types/prediction";
import { PRODUCT_CONFIG } from "~/config/product";
import { differenceInCalendarDays, getDateKeyInTimeZone } from "./calendar";

export function calculateStatistics(
  predictions: PredictionView[],
  referenceDate = new Date(),
): PredictionStatistics {
  const settled = predictions.filter((prediction) => prediction.status !== "PENDING");
  const wonPredictions = settled.filter((prediction) => prediction.status === "WON").length;
  const lostPredictions = settled.filter((prediction) => prediction.status === "LOST").length;
  const voidPredictions = settled.filter((prediction) => prediction.status === "VOID").length;
  const totalRealizedReturnCents = settled.reduce(
    (total, prediction) => total + (prediction.realizedReturnCents ?? 0),
    0,
  );
  const totalSettledStakeCents = settled.reduce(
    (total, prediction) => total + prediction.virtualStakeCents,
    0,
  );
  const decisiveCount = wonPredictions + lostPredictions;
  const chronological = [...settled].sort(
    (left, right) => Date.parse(left.publishedAt) - Date.parse(right.publishedAt),
  );
  let cumulativeNet = 0;
  const cumulativePerformance = chronological.map((prediction) => {
    cumulativeNet += prediction.netResultCents ?? 0;
    return {
      predictionId: prediction.id,
      publicationDate: prediction.publicationDate,
      netResultCents: cumulativeNet,
    };
  });
  const firstDate = predictions.reduce<string | null>((earliest, prediction) => {
    const dateKey = getDateKeyInTimeZone(prediction.publishedAt, PRODUCT_CONFIG.timezone);
    if (earliest === null || dateKey < earliest) {
      return dateKey;
    }
    return earliest;
  }, null);
  const referenceKey = getDateKeyInTimeZone(referenceDate, PRODUCT_CONFIG.timezone);

  return {
    totalPredictions: predictions.length,
    settledPredictions: settled.length,
    pendingPredictions: predictions.length - settled.length,
    wonPredictions,
    lostPredictions,
    voidPredictions,
    totalVirtualStakeCents: predictions.reduce(
      (total, prediction) => total + prediction.virtualStakeCents,
      0,
    ),
    totalSettledStakeCents,
    totalRealizedReturnCents,
    netResultCents: totalRealizedReturnCents - totalSettledStakeCents,
    successRate: decisiveCount === 0 ? null : wonPredictions / decisiveCount,
    roi:
      totalSettledStakeCents === 0
        ? null
        : (totalRealizedReturnCents - totalSettledStakeCents) / totalSettledStakeCents,
    daysSinceFirstPublication:
      firstDate === null
        ? 0
        : Math.max(1, differenceInCalendarDays(firstDate, referenceKey) + 1),
    statusDistribution: {
      PENDING: predictions.length - settled.length,
      WON: wonPredictions,
      LOST: lostPredictions,
      VOID: voidPredictions,
    },
    cumulativePerformance,
  };
}
