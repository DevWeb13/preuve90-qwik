import { PRODUCT_CONFIG } from "~/config/product";
import type { MarketOutcome, Prediction, Settlement, SettlementStatus } from "~/types/prediction";
import { hasPositiveEstimatedValue, parseDecimalOdds } from "~/lib/domain/money";
import { calendarDayNumber, getDateKeyInTimeZone } from "~/lib/domain/calendar";

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

function fail(path: string, message: string): never {
  throw new ContentValidationError(`${path} : ${message}`);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "un objet est attendu");
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(path, "une chaîne non vide est attendue");
  }
  return value;
}

function asOptionalString(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : asString(value, path);
}

function asStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail(path, "une liste non vide est attendue");
  }
  return value.map((item, index) => asString(item, `${path}[${index}]`));
}

function asUtcTimestamp(value: unknown, path: string): string {
  const timestamp = asString(value, path);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp)) {
    fail(path, "un timestamp ISO 8601 UTC est attendu");
  }
  const parsed = new Date(timestamp);
  const canonicalTimestamp = timestamp.includes(".")
    ? timestamp
    : timestamp.replace("Z", ".000Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== canonicalTimestamp) {
    fail(path, "le timestamp est invalide");
  }
  return timestamp;
}

function asSettlementStatus(value: unknown, path: string): SettlementStatus {
  if (value !== "WON" && value !== "LOST" && value !== "VOID") {
    fail(path, "WON, LOST ou VOID est attendu");
  }
  return value;
}

function asEstimatedProbabilityBps(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 9_999) {
    fail(path, "un entier compris entre 1 et 9 999 est attendu");
  }
  return value as number;
}

function validateOutcomes(value: unknown, path: string): MarketOutcome[] {
  if (!Array.isArray(value) || value.length < 2 || value.length > 3) {
    fail(path, "exactement deux ou trois issues sont attendues");
  }

  const names = new Set<string>();
  return value.map((item, index) => {
    const outcome = asRecord(item, `${path}[${index}]`);
    const name = asString(outcome.name, `${path}[${index}].name`);
    const odds = asString(outcome.odds, `${path}[${index}].odds`);
    if (names.has(name)) fail(`${path}[${index}].name`, "les noms d’issues doivent être uniques");
    names.add(name);
    try {
      parseDecimalOdds(odds);
    } catch (error) {
      fail(`${path}[${index}].odds`, error instanceof Error ? error.message : "cote invalide");
    }
    return { name, odds };
  });
}

function validateScores(value: unknown, path: string): Settlement["result"]["scores"] {
  if (value === null) return null;
  if (!Array.isArray(value) || value.length === 0) {
    fail(path, "une liste non vide ou null est attendu");
  }
  const names = new Set<string>();
  return value.map((item, index) => {
    const score = asRecord(item, `${path}[${index}]`);
    const name = asString(score.name, `${path}[${index}].name`);
    if (names.has(name)) fail(`${path}[${index}].name`, "les noms de scores doivent être uniques");
    names.add(name);
    return { name, value: asString(score.value, `${path}[${index}].value`) };
  });
}

export function validatePrediction(value: unknown, path = "prediction"): Prediction {
  const input = asRecord(value, path);
  const sport = asRecord(input.sport, `${path}.sport`);
  const event = asRecord(input.event, `${path}.event`);
  const market = asRecord(input.market, `${path}.market`);
  const selection = asRecord(input.selection, `${path}.selection`);
  const bookmaker = asRecord(input.bookmaker, `${path}.bookmaker`);
  const reasoning = asRecord(input.reasoning, `${path}.reasoning`);
  const source = asRecord(input.source, `${path}.source`);
  const id = asString(input.id, `${path}.id`);
  const publicationDate = asString(input.publicationDate, `${path}.publicationDate`);
  const publishedAt = asUtcTimestamp(input.publishedAt, `${path}.publishedAt`);
  const startsAt = asUtcTimestamp(input.startsAt, `${path}.startsAt`);
  const observedAt = asUtcTimestamp(bookmaker.observedAt, `${path}.bookmaker.observedAt`);
  const recordedOdds = asString(input.recordedOdds, `${path}.recordedOdds`);
  const eventId = asString(event.eventId, `${path}.event.eventId`);
  const participantA = asString(event.participantA, `${path}.event.participantA`);
  const participantB = asString(event.participantB, `${path}.event.participantB`);
  const outcomes = validateOutcomes(market.outcomes, `${path}.market.outcomes`);
  const selectionName = asString(selection.name, `${path}.selection.name`);
  const estimatedProbabilityBps = asEstimatedProbabilityBps(
    reasoning.estimatedProbabilityBps,
    `${path}.reasoning.estimatedProbabilityBps`,
  );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDate)) {
    fail(`${path}.publicationDate`, "le format YYYY-MM-DD est attendu");
  }
  try {
    calendarDayNumber(publicationDate);
  } catch {
    fail(`${path}.publicationDate`, "la date calendaire est impossible");
  }
  if (publicationDate !== getDateKeyInTimeZone(publishedAt, PRODUCT_CONFIG.timezone)) {
    fail(`${path}.publicationDate`, "la date doit correspondre à la publication Europe/Paris");
  }
  if (Date.parse(observedAt) > Date.parse(publishedAt)) {
    fail(`${path}.bookmaker.observedAt`, "l’observation ne peut pas suivre la publication");
  }
  if (Date.parse(publishedAt) >= Date.parse(startsAt)) {
    fail(`${path}.publishedAt`, "la publication doit précéder le début de l’événement");
  }
  if (participantA === participantB) {
    fail(`${path}.event`, "les deux participants doivent être distincts");
  }
  if (market.key !== PRODUCT_CONFIG.market) {
    fail(`${path}.market.key`, `la valeur ${PRODUCT_CONFIG.market} est obligatoire`);
  }

  const selectedOutcome = outcomes.find((outcome) => outcome.name === selectionName);
  if (!selectedOutcome) {
    fail(`${path}.selection.name`, "la sélection doit correspondre exactement à une issue");
  }
  if (recordedOdds !== selectedOutcome.odds) {
    fail(`${path}.recordedOdds`, "la cote doit correspondre exactement à l’issue sélectionnée");
  }
  if (!hasPositiveEstimatedValue(estimatedProbabilityBps, recordedOdds)) {
    fail(`${path}.reasoning.estimatedProbabilityBps`, "l’espérance estimée doit être strictement positive");
  }
  if (bookmaker.key !== PRODUCT_CONFIG.bookmaker.key) {
    fail(`${path}.bookmaker.key`, `la valeur ${PRODUCT_CONFIG.bookmaker.key} est obligatoire`);
  }
  if (bookmaker.name !== PRODUCT_CONFIG.bookmaker.name) {
    fail(`${path}.bookmaker.name`, `la valeur ${PRODUCT_CONFIG.bookmaker.name} est obligatoire`);
  }
  if (input.virtualStakeCents !== PRODUCT_CONFIG.virtualStakeCents) {
    fail(`${path}.virtualStakeCents`, "la mise doit être exactement de 500 centimes");
  }
  if (source.provider !== PRODUCT_CONFIG.oddsProvider) {
    fail(`${path}.source.provider`, "the-odds-api est obligatoire");
  }
  if (source.eventId !== eventId) {
    fail(`${path}.source.eventId`, "l’identifiant source doit correspondre à l’événement");
  }

  return {
    id,
    publicationDate,
    publishedAt,
    startsAt,
    sport: {
      key: asString(sport.key, `${path}.sport.key`),
      title: asString(sport.title, `${path}.sport.title`),
    },
    event: { eventId, participantA, participantB },
    market: { key: PRODUCT_CONFIG.market, outcomes },
    selection: { name: selectionName },
    recordedOdds,
    bookmaker: {
      key: PRODUCT_CONFIG.bookmaker.key,
      name: PRODUCT_CONFIG.bookmaker.name,
      observedAt,
    },
    virtualStakeCents: PRODUCT_CONFIG.virtualStakeCents,
    reasoning: {
      estimatedProbabilityBps,
      summary: asString(reasoning.summary, `${path}.reasoning.summary`),
      factors: asStringArray(reasoning.factors, `${path}.reasoning.factors`),
      uncertainty: asString(reasoning.uncertainty, `${path}.reasoning.uncertainty`),
    },
    source: { provider: PRODUCT_CONFIG.oddsProvider, eventId },
  };
}

export function validateSettlement(value: unknown, path = "settlement"): Settlement {
  const input = asRecord(value, path);
  const result = asRecord(input.result, `${path}.result`);
  const source = asRecord(input.source, `${path}.source`);
  const status = asSettlementStatus(input.status, `${path}.status`);
  const winningOutcomeName =
    result.winningOutcomeName === null
      ? null
      : asString(result.winningOutcomeName, `${path}.result.winningOutcomeName`);
  if (status === "VOID" && winningOutcomeName !== null) {
    fail(`${path}.result.winningOutcomeName`, "VOID exige une issue gagnante null");
  }
  if (status !== "VOID" && winningOutcomeName === null) {
    fail(`${path}.result.winningOutcomeName`, `${status} exige une issue gagnante`);
  }
  if (source.provider !== "the-odds-api" && source.provider !== "official-source") {
    fail(`${path}.source.provider`, "the-odds-api ou official-source est attendu");
  }

  const note = asOptionalString(result.note, `${path}.result.note`);
  const reference = asOptionalString(source.reference, `${path}.source.reference`);
  return {
    predictionId: asString(input.predictionId, `${path}.predictionId`),
    settledAt: asUtcTimestamp(input.settledAt, `${path}.settledAt`),
    status,
    result: {
      winningOutcomeName,
      scores: validateScores(result.scores, `${path}.result.scores`),
      ...(note === undefined ? {} : { note }),
    },
    source: {
      provider: source.provider,
      eventId: asString(source.eventId, `${path}.source.eventId`),
      ...(reference === undefined ? {} : { reference }),
    },
  };
}
