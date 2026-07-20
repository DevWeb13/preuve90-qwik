import { BOOKMAKER, SCAN_CONFIG } from "./config.mjs";
import { normalizeOddsEvents } from "./normalize.mjs";

export async function collectOdds({ client, generatedAt }) {
  const startingRequests = client.getStats().requests;
  const response = await client.getUpcomingOdds();
  const events = normalizeOddsEvents(response.data, { observedAt: response.observedAt });
  const stats = client.getStats();

  return {
    snapshot: {
      schemaVersion: 2,
      generatedAt,
      bookmaker: BOOKMAKER,
      window: {
        minimumLeadMinutes: SCAN_CONFIG.minimumLeadMinutes,
        maximumLeadHours: SCAN_CONFIG.maximumLeadHours,
      },
      events,
    },
    metadata: {
      requests: stats.requests - startingRequests,
      eventsReceived: response.data.length,
      eventsPublished: events.length,
      quota: stats.quota,
    },
  };
}
