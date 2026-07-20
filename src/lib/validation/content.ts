import { PRODUCT_CONFIG } from "~/config/product";
import type {
  Prediction,
  PredictionSelection,
  Settlement,
  SettlementStatus,
} from "~/types/prediction";
import { parseDecimalOdds } from "~/lib/domain/money";

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
  if (Number.isNaN(Date.parse(timestamp))) {
    fail(path, "le timestamp est invalide");
  }
  return timestamp;
}

function parisDateKey(timestamp: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: PRODUCT_CONFIG.timezone,
  }).formatToParts(new Date(timestamp));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function asSelection(value: unknown, path: string): PredictionSelection {
  if (value !== "HOME" && value !== "DRAW" && value !== "AWAY") {
    fail(path, "HOME, DRAW ou AWAY est attendu");
  }
  return value;
}

function asSettlementStatus(value: unknown, path: string): SettlementStatus {
  if (value !== "WON" && value !== "LOST" && value !== "VOID") {
    fail(path, "WON, LOST ou VOID est attendu");
  }
  return value;
}

function asScore(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    fail(path, "un score entier positif est attendu");
  }
  return value as number;
}

export function validatePrediction(value: unknown, path = "prediction"): Prediction {
  const input = asRecord(value, path);
  const competition = asRecord(input.competition, `${path}.competition`);
  const match = asRecord(input.match, `${path}.match`);
  const bookmaker = asRecord(input.bookmaker, `${path}.bookmaker`);
  const reasoning = asRecord(input.reasoning, `${path}.reasoning`);
  const source = asRecord(input.source, `${path}.source`);
  const id = asString(input.id, `${path}.id`);
  const publicationDate = asString(input.publicationDate, `${path}.publicationDate`);
  const publishedAt = asUtcTimestamp(input.publishedAt, `${path}.publishedAt`);
  const kickoffAt = asUtcTimestamp(input.kickoffAt, `${path}.kickoffAt`);
  const observedAt = asUtcTimestamp(bookmaker.observedAt, `${path}.bookmaker.observedAt`);
  const recordedOdds = asString(input.recordedOdds, `${path}.recordedOdds`);
  const eventId = asString(match.eventId, `${path}.match.eventId`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDate)) {
    fail(`${path}.publicationDate`, "le format YYYY-MM-DD est attendu");
  }
  if (publicationDate !== parisDateKey(publishedAt)) {
    fail(`${path}.publicationDate`, "la date doit correspondre à la publication Europe/Paris");
  }
  if (Date.parse(observedAt) > Date.parse(publishedAt)) {
    fail(`${path}.bookmaker.observedAt`, "l’observation ne peut pas suivre la publication");
  }
  if (Date.parse(publishedAt) >= Date.parse(kickoffAt)) {
    fail(`${path}.publishedAt`, "la publication doit précéder le coup d’envoi");
  }

  try {
    parseDecimalOdds(recordedOdds);
  } catch (error) {
    fail(`${path}.recordedOdds`, error instanceof Error ? error.message : "cote invalide");
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
    fail(`${path}.source.eventId`, "l’identifiant source doit correspondre au match");
  }

  const country = competition.country;
  if (country !== undefined && (typeof country !== "string" || country.trim() === "")) {
    fail(`${path}.competition.country`, "une chaîne non vide est attendue lorsqu’elle existe");
  }

  return {
    id,
    publicationDate,
    publishedAt,
    kickoffAt,
    competition: {
      key: asString(competition.key, `${path}.competition.key`),
      name: asString(competition.name, `${path}.competition.name`),
      ...(country === undefined ? {} : { country }),
    },
    match: {
      eventId,
      homeTeam: asString(match.homeTeam, `${path}.match.homeTeam`),
      awayTeam: asString(match.awayTeam, `${path}.match.awayTeam`),
    },
    selection: asSelection(input.selection, `${path}.selection`),
    recordedOdds,
    bookmaker: {
      key: PRODUCT_CONFIG.bookmaker.key,
      name: PRODUCT_CONFIG.bookmaker.name,
      observedAt,
    },
    virtualStakeCents: PRODUCT_CONFIG.virtualStakeCents,
    reasoning: {
      summary: asString(reasoning.summary, `${path}.reasoning.summary`),
      factors: asStringArray(reasoning.factors, `${path}.reasoning.factors`),
      uncertainty: asString(reasoning.uncertainty, `${path}.reasoning.uncertainty`),
    },
    source: {
      provider: PRODUCT_CONFIG.oddsProvider,
      eventId,
    },
  };
}

export function validateSettlement(value: unknown, path = "settlement"): Settlement {
  const input = asRecord(value, path);
  const finalScore = asRecord(input.finalScore, `${path}.finalScore`);
  const source = asRecord(input.source, `${path}.source`);
  const eventId = asString(source.eventId, `${path}.source.eventId`);

  if (source.provider !== PRODUCT_CONFIG.oddsProvider) {
    fail(`${path}.source.provider`, "the-odds-api est obligatoire");
  }

  return {
    predictionId: asString(input.predictionId, `${path}.predictionId`),
    settledAt: asUtcTimestamp(input.settledAt, `${path}.settledAt`),
    status: asSettlementStatus(input.status, `${path}.status`),
    finalScore: {
      home: asScore(finalScore.home, `${path}.finalScore.home`),
      away: asScore(finalScore.away, `${path}.finalScore.away`),
    },
    source: {
      provider: PRODUCT_CONFIG.oddsProvider,
      eventId,
    },
  };
}
