import { BOOKMAKER, ODDS_QUERY, SCAN_CONFIG, isValidSportKey } from "./config.mjs";

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function utcTimestamp(value) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function decimalOdds(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 1) return null;
  const raw = String(value);
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return null;
  if (!raw.includes(".")) return `${raw}.00`;
  const [integer, fraction] = raw.split(".");
  return `${integer}.${fraction.padEnd(2, "0")}`;
}

function compareEvents(left, right) {
  return left.startsAt.localeCompare(right.startsAt) || left.eventId.localeCompare(right.eventId);
}

function isInsideScanWindow(startsAt, observedAt) {
  const leadMilliseconds = Date.parse(startsAt) - Date.parse(observedAt);
  return (
    leadMilliseconds >= SCAN_CONFIG.minimumLeadMinutes * 60_000 &&
    leadMilliseconds <= SCAN_CONFIG.maximumLeadHours * 60 * 60_000
  );
}

export function normalizeOddsEvents(rawEvents, { observedAt }) {
  const canonicalObservedAt = utcTimestamp(observedAt);
  if (!Array.isArray(rawEvents) || !canonicalObservedAt) return [];

  const normalized = [];
  for (const rawEvent of rawEvents) {
    if (!isRecord(rawEvent) || !isValidSportKey(rawEvent.sport_key)) continue;
    const eventId = nonEmptyString(rawEvent.id);
    const sportKey = nonEmptyString(rawEvent.sport_key);
    const sportTitle = nonEmptyString(rawEvent.sport_title);
    const participantA = nonEmptyString(rawEvent.home_team);
    const participantB = nonEmptyString(rawEvent.away_team);
    const startsAt = utcTimestamp(rawEvent.commence_time);
    if (
      !eventId ||
      !sportKey ||
      !sportTitle ||
      !participantA ||
      !participantB ||
      participantA === participantB ||
      !startsAt ||
      !isInsideScanWindow(startsAt, canonicalObservedAt) ||
      !Array.isArray(rawEvent.bookmakers)
    ) {
      continue;
    }

    const bookmakers = rawEvent.bookmakers.filter(
      (bookmaker) => isRecord(bookmaker) && bookmaker.key === BOOKMAKER.key,
    );
    if (bookmakers.length !== 1 || !Array.isArray(bookmakers[0].markets)) continue;
    const markets = bookmakers[0].markets.filter(
      (market) => isRecord(market) && market.key === ODDS_QUERY.market,
    );
    if (markets.length !== 1 || !Array.isArray(markets[0].outcomes)) continue;
    const rawOutcomes = markets[0].outcomes;
    if (
      rawOutcomes.length < 2 ||
      rawOutcomes.length > 3 ||
      rawOutcomes.some((outcome) => !isRecord(outcome))
    ) {
      continue;
    }

    const outcomes = [];
    const outcomeNames = new Set();
    let invalidOutcome = false;
    for (const rawOutcome of rawOutcomes) {
      const name = nonEmptyString(rawOutcome.name);
      const odds = decimalOdds(rawOutcome.price);
      if (!name || !odds || outcomeNames.has(name)) {
        invalidOutcome = true;
        break;
      }
      outcomeNames.add(name);
      outcomes.push({ name, odds });
    }
    if (invalidOutcome || !outcomeNames.has(participantA) || !outcomeNames.has(participantB)) {
      continue;
    }

    normalized.push({
      eventId,
      sportKey,
      sportTitle,
      participantA,
      participantB,
      startsAt,
      observedAt: canonicalObservedAt,
      market: { key: ODDS_QUERY.market, outcomes },
    });
  }

  return normalized.sort(compareEvents);
}

function ambiguousResult(target) {
  return {
    eventId: target.eventId,
    sportKey: target.sportKey,
    participantA: target.participantA,
    participantB: target.participantB,
    startsAt: target.startsAt,
    completed: false,
    status: "ambiguous",
    scores: null,
  };
}

export function normalizeScoreEvents(rawEvents, targets) {
  if (!Array.isArray(rawEvents) || !Array.isArray(targets)) return [];
  const rawByEventId = new Map();
  for (const rawEvent of rawEvents) {
    if (!isRecord(rawEvent) || typeof rawEvent.id !== "string") continue;
    const matches = rawByEventId.get(rawEvent.id) ?? [];
    matches.push(rawEvent);
    rawByEventId.set(rawEvent.id, matches);
  }

  const normalized = [];
  for (const target of targets) {
    const matches = rawByEventId.get(target.eventId) ?? [];
    if (matches.length === 0) continue;
    if (matches.length !== 1) {
      normalized.push(ambiguousResult(target));
      continue;
    }

    const rawEvent = matches[0];
    const startsAt = utcTimestamp(rawEvent.commence_time);
    if (
      rawEvent.sport_key !== target.sportKey ||
      rawEvent.home_team !== target.participantA ||
      rawEvent.away_team !== target.participantB ||
      startsAt !== target.startsAt
    ) {
      normalized.push(ambiguousResult(target));
      continue;
    }

    if (rawEvent.completed !== true) {
      normalized.push({ ...ambiguousResult(target), status: "incomplete" });
      continue;
    }

    if (!Array.isArray(rawEvent.scores) || rawEvent.scores.length < 2) {
      normalized.push(ambiguousResult(target));
      continue;
    }
    const scores = [];
    const scoreNames = new Set();
    let invalidScore = false;
    for (const rawScore of rawEvent.scores) {
      if (!isRecord(rawScore)) {
        invalidScore = true;
        break;
      }
      const name = nonEmptyString(rawScore.name);
      const value = nonEmptyString(rawScore.score);
      if (!name || !value || scoreNames.has(name)) {
        invalidScore = true;
        break;
      }
      scoreNames.add(name);
      scores.push({ name, value });
    }
    if (
      invalidScore ||
      !scoreNames.has(target.participantA) ||
      !scoreNames.has(target.participantB)
    ) {
      normalized.push(ambiguousResult(target));
      continue;
    }

    normalized.push({
      eventId: target.eventId,
      sportKey: target.sportKey,
      participantA: target.participantA,
      participantB: target.participantB,
      startsAt: target.startsAt,
      completed: true,
      status: "complete",
      scores,
    });
  }

  return normalized.sort(compareEvents);
}
