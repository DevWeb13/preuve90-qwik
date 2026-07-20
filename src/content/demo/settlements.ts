import type { Settlement } from "~/types/prediction";

export const demoSettlements: Settlement[] = [
  {
    predictionId: "demo-2026-07-19-nantes-lille",
    settledAt: "2026-07-19T19:10:00Z",
    status: "WON",
    finalScore: { home: 0, away: 2 },
    source: { provider: "the-odds-api", eventId: "demo-event-006" },
  },
  {
    predictionId: "demo-2026-07-18-brest-rennes",
    settledAt: "2026-07-18T18:15:00Z",
    status: "WON",
    finalScore: { home: 1, away: 1 },
    source: { provider: "the-odds-api", eventId: "demo-event-005" },
  },
  {
    predictionId: "demo-2026-07-17-marseille-nice",
    settledAt: "2026-07-17T21:15:00Z",
    status: "LOST",
    finalScore: { home: 0, away: 1 },
    source: { provider: "the-odds-api", eventId: "demo-event-004" },
  },
  {
    predictionId: "demo-2026-07-16-lens-monaco",
    settledAt: "2026-07-16T20:20:00Z",
    status: "WON",
    finalScore: { home: 1, away: 3 },
    source: { provider: "the-odds-api", eventId: "demo-event-003" },
  },
  {
    predictionId: "demo-2026-07-15-toulouse-angers",
    settledAt: "2026-07-15T18:30:00Z",
    status: "VOID",
    finalScore: { home: 0, away: 0 },
    source: { provider: "the-odds-api", eventId: "demo-event-002" },
  },
  {
    predictionId: "demo-2026-07-14-bordeaux-metz",
    settledAt: "2026-07-14T20:10:00Z",
    status: "LOST",
    finalScore: { home: 1, away: 2 },
    source: { provider: "the-odds-api", eventId: "demo-event-001" },
  },
];
