import type { PredictionStatistics, PredictionView } from "~/types/prediction";

function dayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

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
    if (earliest === null || prediction.publicationDate < earliest) {
      return prediction.publicationDate;
    }
    return earliest;
  }, null);
  const referenceKey = [
    referenceDate.getUTCFullYear(),
    String(referenceDate.getUTCMonth() + 1).padStart(2, "0"),
    String(referenceDate.getUTCDate()).padStart(2, "0"),
  ].join("-");

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
      firstDate === null ? 0 : Math.max(1, dayNumber(referenceKey) - dayNumber(firstDate) + 1),
    statusDistribution: {
      PENDING: predictions.length - settled.length,
      WON: wonPredictions,
      LOST: lostPredictions,
      VOID: voidPredictions,
    },
    cumulativePerformance,
  };
}
