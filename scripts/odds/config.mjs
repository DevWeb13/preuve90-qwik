import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PRODUCT_CONTRACT = require("../../src/config/product-contract.json");

export const API_BASE_URL = "https://api.the-odds-api.com/v4/";

export const BOOKMAKER = Object.freeze({ ...PRODUCT_CONTRACT.bookmaker });
export const ODDS_QUERY = Object.freeze({
  market: PRODUCT_CONTRACT.market,
  oddsFormat: "decimal",
  dateFormat: "iso",
});

export const SCAN_CONFIG = Object.freeze({
  minimumLeadMinutes: PRODUCT_CONTRACT.minimumLeadMinutes,
  maximumLeadHours: PRODUCT_CONTRACT.maximumLeadHours,
  maximumSnapshotAgeMinutes: PRODUCT_CONTRACT.maximumSnapshotAgeMinutes,
  maximumPublishedPerScan: PRODUCT_CONTRACT.maximumPublishedPerScan,
  maximumUpcomingEvents: PRODUCT_CONTRACT.maximumUpcomingEvents,
  virtualStakeCents: PRODUCT_CONTRACT.virtualStakeCents,
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

export function isValidSportKey(sportKey) {
  return typeof sportKey === "string" && /^[a-z0-9_]+$/.test(sportKey);
}
