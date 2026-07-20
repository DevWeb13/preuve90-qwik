import { demoPredictions } from "~/content/demo/predictions";
import { demoSettlements } from "~/content/demo/settlements";
import { assemblePredictions } from "~/lib/domain/content";
import { calculateStatistics } from "~/lib/domain/statistics";
import type { ContentResult, ContentSnapshot } from "~/types/prediction";

const predictionModules = import.meta.glob("../../content/predictions/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const settlementModules = import.meta.glob("../../content/settlements/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

export function loadContentSnapshot(referenceDate = new Date()): ContentSnapshot {
  const realPredictions = Object.values(predictionModules);
  const useDemo = import.meta.env.DEV && realPredictions.length === 0;
  const predictions = assemblePredictions(
    useDemo ? demoPredictions : realPredictions,
    useDemo ? demoSettlements : Object.values(settlementModules),
  );

  return {
    predictions,
    statistics: calculateStatistics(predictions, referenceDate),
    isDemo: useDemo,
  };
}

export function loadContentResult(referenceDate = new Date()): ContentResult {
  try {
    const snapshot = loadContentSnapshot(referenceDate);
    return snapshot.predictions.length === 0
      ? { state: "empty", snapshot }
      : { state: "ready", snapshot };
  } catch (error) {
    console.error("Le contenu Preuve90 est invalide.", error);
    return {
      state: "error",
      message: "Les données publiées n’ont pas pu être validées. Aucun contenu incertain n’est affiché.",
    };
  }
}
