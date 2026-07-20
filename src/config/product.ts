export const PRODUCT_CONFIG = {
  virtualStakeCents: 500,
  market: "1N2",
  regulationTimeOnly: true,
  timezone: "Europe/Paris",
  locale: "fr-FR",
  bookmaker: {
    key: "betclic_fr",
    name: "Betclic (FR)",
  },
  oddsProvider: "the-odds-api",
  monthlyApiCreditLimit: 500,
} as const;

export const SELECTION_LABELS = {
  HOME: "1 — équipe à domicile",
  DRAW: "N — match nul",
  AWAY: "2 — équipe à l’extérieur",
} as const;

export const SELECTION_SHORT_LABELS = {
  HOME: "1",
  DRAW: "N",
  AWAY: "2",
} as const;

export const STATUS_LABELS = {
  PENDING: "En attente",
  WON: "Gagné",
  LOST: "Perdu",
  VOID: "Annulé",
} as const;
