import type { PredictionView } from "~/types/prediction";
import { ContentValidationError, validatePrediction, validateSettlement } from "~/lib/validation/content";
import {
  createPredictionView,
  getExpectedSettlementStatus,
  sortPredictionsNewestFirst,
} from "./predictions";

export function assemblePredictions(
  predictionInputs: unknown[],
  settlementInputs: unknown[],
): PredictionView[] {
  const predictions = predictionInputs.map((input, index) =>
    validatePrediction(input, `predictions[${index}]`),
  );
  const settlements = settlementInputs.map((input, index) =>
    validateSettlement(input, `settlements[${index}]`),
  );
  const predictionIds = new Set<string>();
  const eventIds = new Set<string>();

  for (const prediction of predictions) {
    if (predictionIds.has(prediction.id)) {
      throw new ContentValidationError(`Identifiant de prédiction dupliqué : ${prediction.id}`);
    }
    if (eventIds.has(prediction.event.eventId)) {
      throw new ContentValidationError(
        `Événement publié plusieurs fois : ${prediction.event.eventId}`,
      );
    }
    predictionIds.add(prediction.id);
    eventIds.add(prediction.event.eventId);
  }

  const settlementsByPrediction = new Map<string, (typeof settlements)[number]>();
  for (const settlement of settlements) {
    const prediction = predictions.find((item) => item.id === settlement.predictionId);
    if (!prediction) {
      throw new ContentValidationError(
        `Le règlement ${settlement.predictionId} ne correspond à aucune publication`,
      );
    }
    if (settlementsByPrediction.has(settlement.predictionId)) {
      throw new ContentValidationError(
        `Plusieurs règlements existent pour ${settlement.predictionId}`,
      );
    }
    if (settlement.source.eventId !== prediction.event.eventId) {
      throw new ContentValidationError(
        `Le règlement ${settlement.predictionId} référence un autre événement`,
      );
    }
    if (Date.parse(settlement.settledAt) <= Date.parse(prediction.startsAt)) {
      throw new ContentValidationError(
        `Le règlement ${settlement.predictionId} doit suivre le début de l’événement`,
      );
    }
    const winningOutcomeName = settlement.result.winningOutcomeName;
    if (
      winningOutcomeName !== null &&
      !prediction.market.outcomes.some((outcome) => outcome.name === winningOutcomeName)
    ) {
      throw new ContentValidationError(
        `L’issue gagnante du règlement ${settlement.predictionId} n’existe pas dans le marché publié`,
      );
    }
    if (settlement.status !== "VOID" && winningOutcomeName !== null && settlement.status !== getExpectedSettlementStatus(prediction.selection.name, winningOutcomeName)) {
      throw new ContentValidationError(
        `Statut ${settlement.status} incohérent pour ${settlement.predictionId} : sélection ${prediction.selection.name}, issue gagnante ${winningOutcomeName}`,
      );
    }
    settlementsByPrediction.set(settlement.predictionId, settlement);
  }

  return sortPredictionsNewestFirst(
    predictions.map((prediction) =>
      createPredictionView(prediction, settlementsByPrediction.get(prediction.id)),
    ),
  );
}
