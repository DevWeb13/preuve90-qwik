export const API_BASE_URL = "https://api.the-odds-api.com/v4/";

export const COMPETITIONS = Object.freeze([
  Object.freeze({ key: "soccer_france_ligue_one", name: "Ligue 1" }),
  Object.freeze({ key: "soccer_epl", name: "Premier League" }),
  Object.freeze({ key: "soccer_uefa_champs_league", name: "Ligue des champions UEFA" }),
]);

export const BOOKMAKER = Object.freeze({ key: "betclic_fr", name: "Betclic (FR)" });
export const ODDS_QUERY = Object.freeze({
  region: "fr",
  market: "h2h",
  oddsFormat: "decimal",
  dateFormat: "iso",
});

export const API_BUDGET = Object.freeze({
  absoluteLimit: 500,
  minimumRemaining: 50,
  operationalMaximumUsed: 450,
});

export const QUOTA_HEADERS = Object.freeze({
  used: "x-requests-used",
  remaining: "x-requests-remaining",
  lastRequestCost: "x-requests-last",
});

const competitionByKey = new Map(COMPETITIONS.map((competition) => [competition.key, competition]));

export function getCompetition(sportKey) {
  return competitionByKey.get(sportKey) ?? null;
}

export function isAllowedSportKey(sportKey) {
  return competitionByKey.has(sportKey);
}
