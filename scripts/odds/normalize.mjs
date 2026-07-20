import { BOOKMAKER, getCompetition } from "./config.mjs";

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
  if (!raw.includes(".")) return `${raw}.00`;
  const [integer, fraction] = raw.split(".");
  return `${integer}.${fraction.padEnd(2, "0")}`;
}

function compareEvents(left, right) {
  return left.kickoffAt.localeCompare(right.kickoffAt) || left.eventId.localeCompare(right.eventId);
}

export function normalizeOddsEvents(rawEvents, { sportKey, observedAt }) {
  const competition = getCompetition(sportKey);
  if (!competition || !Array.isArray(rawEvents) || !utcTimestamp(observedAt)) return [];

  const normalized = [];
  for (const rawEvent of rawEvents) {
    if (!isRecord(rawEvent) || rawEvent.sport_key !== sportKey) continue;
    const eventId = nonEmptyString(rawEvent.id);
    const homeTeam = nonEmptyString(rawEvent.home_team);
    const awayTeam = nonEmptyString(rawEvent.away_team);
    const kickoffAt = utcTimestamp(rawEvent.commence_time);
    if (
      !eventId ||
      !homeTeam ||
      !awayTeam ||
      homeTeam === awayTeam ||
      !kickoffAt ||
      Date.parse(kickoffAt) <= Date.parse(observedAt) ||
      !Array.isArray(rawEvent.bookmakers)
    ) {
      continue;
    }

    const bookmakers = rawEvent.bookmakers.filter(
      (bookmaker) => isRecord(bookmaker) && bookmaker.key === BOOKMAKER.key,
    );
    if (bookmakers.length !== 1 || !Array.isArray(bookmakers[0].markets)) continue;
    const markets = bookmakers[0].markets.filter(
      (market) => isRecord(market) && market.key === "h2h",
    );
    if (markets.length !== 1 || !Array.isArray(markets[0].outcomes)) continue;
    const outcomes = markets[0].outcomes;
    if (outcomes.length !== 3 || outcomes.some((outcome) => !isRecord(outcome))) continue;

    const prices = new Map();
    for (const outcome of outcomes) {
      const name = nonEmptyString(outcome.name);
      const price = decimalOdds(outcome.price);
      if (!name || !price || prices.has(name)) continue;
      prices.set(name, price);
    }
    const home = prices.get(homeTeam);
    const draw = prices.get("Draw");
    const away = prices.get(awayTeam);
    if (!home || !draw || !away || prices.size !== 3) continue;

    normalized.push({
      eventId,
      sportKey,
      competitionName: competition.name,
      homeTeam,
      awayTeam,
      kickoffAt,
      observedAt: new Date(observedAt).toISOString(),
      odds: { home, draw, away },
    });
  }

  return normalized.sort(compareEvents);
}

function parseScore(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const score = Number(value);
  return Number.isSafeInteger(score) ? score : null;
}

function ambiguousResult(target) {
  return {
    eventId: target.eventId,
    sportKey: target.sportKey,
    homeTeam: target.homeTeam,
    awayTeam: target.awayTeam,
    kickoffAt: target.kickoffAt,
    completed: false,
    status: "ambiguous",
    score: null,
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
    const kickoffAt = utcTimestamp(rawEvent.commence_time);
    if (
      rawEvent.sport_key !== target.sportKey ||
      rawEvent.home_team !== target.homeTeam ||
      rawEvent.away_team !== target.awayTeam ||
      kickoffAt !== target.kickoffAt
    ) {
      normalized.push(ambiguousResult(target));
      continue;
    }

    if (rawEvent.completed !== true) {
      normalized.push({ ...ambiguousResult(target), status: "incomplete" });
      continue;
    }

    if (!Array.isArray(rawEvent.scores) || rawEvent.scores.length !== 2) {
      normalized.push(ambiguousResult(target));
      continue;
    }
    const scores = new Map();
    for (const item of rawEvent.scores) {
      if (!isRecord(item) || typeof item.name !== "string" || scores.has(item.name)) continue;
      const score = parseScore(item.score);
      if (score !== null) scores.set(item.name, score);
    }
    if (scores.size !== 2 || !scores.has(target.homeTeam) || !scores.has(target.awayTeam)) {
      normalized.push(ambiguousResult(target));
      continue;
    }

    normalized.push({
      eventId: target.eventId,
      sportKey: target.sportKey,
      homeTeam: target.homeTeam,
      awayTeam: target.awayTeam,
      kickoffAt: target.kickoffAt,
      completed: true,
      status: "complete",
      score: { home: scores.get(target.homeTeam), away: scores.get(target.awayTeam) },
    });
  }

  return normalized.sort(compareEvents);
}
