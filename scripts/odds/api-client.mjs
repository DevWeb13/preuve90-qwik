import { API_BASE_URL, BOOKMAKER, ODDS_QUERY, isAllowedSportKey } from "./config.mjs";
import { createApiBudget } from "./budget.mjs";

export class OddsApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "OddsApiError";
  }
}

export function requireApiKey(environment = process.env) {
  const apiKey = environment.THE_ODDS_API_KEY;
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new OddsApiError("THE_ODDS_API_KEY est requis pour cette commande.");
  }
  return apiKey;
}

function canonicalRequestKey(pathname, parameters) {
  const entries = Object.entries(parameters).sort(([left], [right]) => left.localeCompare(right));
  return `${pathname}?${new URLSearchParams(entries).toString()}`;
}

function assertAllowedCompetition(sportKey) {
  if (!isAllowedSportKey(sportKey)) {
    throw new OddsApiError(`Compétition The Odds API non autorisée : ${sportKey}.`);
  }
}

export function createOddsApiClient({
  apiKey,
  fetchImpl = globalThis.fetch,
  clock = () => new Date(),
  logger = console,
  budget = createApiBudget({ logger }),
} = {}) {
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new OddsApiError("THE_ODDS_API_KEY est requis pour cette commande.");
  }
  if (typeof fetchImpl !== "function") {
    throw new OddsApiError("Aucune implémentation fetch valide n’est disponible.");
  }

  const requests = new Map();
  let requestCount = 0;

  async function request(pathname, parameters) {
    const requestKey = canonicalRequestKey(pathname, parameters);
    if (requests.has(requestKey)) return requests.get(requestKey);

    budget.assertCanRequest();
    const pendingRequest = (async () => {
      const url = new URL(pathname, API_BASE_URL);
      for (const [name, value] of Object.entries(parameters)) url.searchParams.set(name, value);
      url.searchParams.set("apiKey", apiKey);
      requestCount += 1;

      let response;
      try {
        response = await fetchImpl(url);
      } catch {
        throw new OddsApiError("The Odds API est temporairement inaccessible.");
      }

      const quota = budget.record(response.headers);
      if (!response.ok) {
        throw new OddsApiError(`The Odds API a répondu avec le statut HTTP ${response.status}.`);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new OddsApiError("La réponse The Odds API n’est pas un JSON valide.");
      }

      return { data, observedAt: clock().toISOString(), quota };
    })();

    requests.set(requestKey, pendingRequest);
    try {
      return await pendingRequest;
    } catch (error) {
      requests.delete(requestKey);
      throw error;
    }
  }

  return {
    async getOdds(sportKey, commenceTimeFrom) {
      assertAllowedCompetition(sportKey);
      const response = await request(`sports/${sportKey}/odds`, {
        bookmakers: BOOKMAKER.key,
        commenceTimeFrom,
        dateFormat: ODDS_QUERY.dateFormat,
        markets: ODDS_QUERY.market,
        oddsFormat: ODDS_QUERY.oddsFormat,
        regions: ODDS_QUERY.region,
      });
      if (!Array.isArray(response.data)) {
        throw new OddsApiError("La réponse de cotes The Odds API est invalide.");
      }
      return response;
    },

    async getScores(sportKey, eventIds) {
      assertAllowedCompetition(sportKey);
      const uniqueEventIds = [...new Set(eventIds)].sort();
      if (uniqueEventIds.length === 0) {
        return { data: [], observedAt: clock().toISOString(), quota: budget.getQuota() };
      }
      const response = await request(`sports/${sportKey}/scores`, {
        dateFormat: ODDS_QUERY.dateFormat,
        daysFrom: "3",
        eventIds: uniqueEventIds.join(","),
      });
      if (!Array.isArray(response.data)) {
        throw new OddsApiError("La réponse de scores The Odds API est invalide.");
      }
      return response;
    },

    getStats() {
      return { requests: requestCount, quota: budget.getQuota() };
    },
  };
}
