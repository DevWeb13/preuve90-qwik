import type { Settlement } from "~/types/prediction";

export const demoSettlements: Settlement[] = [
  {
    predictionId: "demo-2026-07-20-football-draw",
    settledAt: "2026-07-20T14:10:00Z",
    status: "WON",
    result: {
      winningOutcomeName: "Draw",
      scores: [
        { name: "Paris Bleu", value: "1" },
        { name: "Lyon Lumière", value: "1" },
      ],
    },
    source: {
      provider: "betclic-public",
      eventId: "demo-event-football",
      reference: "https://www.betclic.fr/sport/demo-event-football",
    },
  },
  {
    predictionId: "demo-2026-07-20-tennis-a",
    settledAt: "2026-07-20T15:05:00Z",
    status: "WON",
    result: {
      winningOutcomeName: "Joueur Azur",
      scores: [
        { name: "Joueur Azur", value: "2" },
        { name: "Joueur Corail", value: "0" },
      ],
    },
    source: {
      provider: "betclic-public",
      eventId: "demo-event-tennis-a",
      reference: "https://www.betclic.fr/sport/demo-event-tennis-a",
    },
  },
  {
    predictionId: "demo-2026-07-20-basket-b",
    settledAt: "2026-07-20T17:00:00Z",
    status: "LOST",
    result: {
      winningOutcomeName: "Orion Basket",
      scores: [
        { name: "Orion Basket", value: "88" },
        { name: "Nova Basket", value: "81" },
      ],
    },
    source: {
      provider: "betclic-public",
      eventId: "demo-event-basket-b",
      reference: "https://www.betclic.fr/sport/demo-event-basket-b",
    },
  },
  {
    predictionId: "demo-2026-07-19-tennis-void",
    settledAt: "2026-07-19T13:30:00Z",
    status: "VOID",
    result: {
      winningOutcomeName: null,
      scores: null,
      note: "Annulation fictive confirmée pour tester l’état VOID.",
    },
    source: {
      provider: "official-source",
      eventId: "demo-event-tennis-void",
      reference: "https://example.test/official/demo-event-tennis-void",
    },
  },
];
