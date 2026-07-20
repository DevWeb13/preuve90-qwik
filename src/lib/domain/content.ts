import type { PredictionView } from "~/types/prediction";
import { ContentValidationError, validatePrediction, validateSettlement } from "~/lib/validation/content";
import { createPredictionView, sortPredictionsNewestFirst } from "./predictions";

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
  const publicationDates = new Set<string>();
  const eventIds = new Set<string>();

  for (const prediction of predictions) {
    if (predictionIds.has(prediction.id)) {
      throw new ContentValidationError(`Identifiant de prédiction dupliqué : ${prediction.id}`);
    }
    if (publicationDates.has(prediction.publicationDate)) {
      throw new ContentValidationError(
        `Plusieurs publications existent pour la date ${prediction.publicationDate}`,
      );
    }
    if (eventIds.has(prediction.match.eventId)) {
      throw new ContentValidationError(`Match publié plusieurs fois : ${prediction.match.eventId}`);
    }
    predictionIds.add(prediction.id);
    publicationDates.add(prediction.publicationDate);
    eventIds.add(prediction.match.eventId);
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
    if (settlement.source.eventId !== prediction.match.eventId) {
      throw new ContentValidationError(
        `Le règlement ${settlement.predictionId} référence un autre match`,
      );
    }
    if (Date.parse(settlement.settledAt) <= Date.parse(prediction.kickoffAt)) {
      throw new ContentValidationError(
        `Le règlement ${settlement.predictionId} doit suivre le coup d’envoi`,
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
