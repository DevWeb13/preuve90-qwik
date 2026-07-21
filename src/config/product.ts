import productContract from "./product-contract.json";

export const PRODUCT_CONFIG = {
  virtualStakeCents: productContract.virtualStakeCents as 500,
  market: productContract.market as "h2h",
  minimumLeadMinutes: productContract.minimumLeadMinutes,
  maximumLeadHours: productContract.maximumLeadHours,
  maximumPublishedPerScan: productContract.maximumPublishedPerScan,
  timezone: "Europe/Paris",
  locale: "fr-FR",
  bookmaker: productContract.bookmaker as {
    key: "betclic_fr";
    name: "Betclic (FR)";
  },
  sourceProvider: "betclic-public",
} as const;

export const STATUS_LABELS = {
  PENDING: "En attente",
  WON: "Gagné",
  LOST: "Perdu",
  VOID: "Annulé",
} as const;
