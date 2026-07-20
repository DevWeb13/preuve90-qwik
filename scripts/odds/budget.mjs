import { API_BUDGET, QUOTA_HEADERS } from "./config.mjs";

export class ApiBudgetError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiBudgetError";
  }
}

function readNonNegativeInteger(headers, name) {
  const rawValue = headers.get(name);
  if (rawValue === null || !/^\d+$/.test(rawValue.trim())) return null;
  const value = Number(rawValue);
  return Number.isSafeInteger(value) ? value : null;
}

export function readQuotaHeaders(headers) {
  return {
    used: readNonNegativeInteger(headers, QUOTA_HEADERS.used),
    remaining: readNonNegativeInteger(headers, QUOTA_HEADERS.remaining),
    lastRequestCost: readNonNegativeInteger(headers, QUOTA_HEADERS.lastRequestCost),
  };
}

export function createApiBudget({ logger = console } = {}) {
  let latestQuota = { used: null, remaining: null, lastRequestCost: null };
  let lastKnownUsed = null;
  let lastKnownRemaining = null;

  return {
    assertCanRequest() {
      if (
        (lastKnownRemaining !== null && lastKnownRemaining <= API_BUDGET.minimumRemaining) ||
        (lastKnownUsed !== null && lastKnownUsed >= API_BUDGET.operationalMaximumUsed)
      ) {
        throw new ApiBudgetError(
          `Appel The Odds API refusé : marge minimale de ${API_BUDGET.minimumRemaining} crédits atteinte.`,
        );
      }
    },

    record(headers) {
      latestQuota = readQuotaHeaders(headers);
      if (latestQuota.used !== null) lastKnownUsed = latestQuota.used;
      if (latestQuota.remaining !== null) lastKnownRemaining = latestQuota.remaining;

      if (Object.values(latestQuota).some((value) => value === null)) {
        logger.warn(
          "En-têtes de quota The Odds API absents ou invalides ; les valeurs inconnues restent null.",
        );
      }

      return latestQuota;
    },

    getQuota() {
      return { ...latestQuota };
    },
  };
}
