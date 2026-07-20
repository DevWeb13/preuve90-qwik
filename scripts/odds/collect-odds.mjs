import { COMPETITIONS, BOOKMAKER } from "./config.mjs";
import { normalizeOddsEvents } from "./normalize.mjs";

export async function collectOdds({ client, generatedAt }) {
  const startingRequests = client.getStats().requests;
  const events = [];
  let eventsReceived = 0;
  const activeSports = new Set((await client.getActiveSports()).data);
  const activeCompetitions = COMPETITIONS.filter((competition) =>
    activeSports.has(competition.key),
  );
  const inactiveCompetitions = COMPETITIONS.filter(
    (competition) => !activeSports.has(competition.key),
  ).map((competition) => competition.key);

  for (const competition of activeCompetitions) {
    const response = await client.getOdds(competition.key, generatedAt);
    eventsReceived += response.data.length;
    events.push(
      ...normalizeOddsEvents(response.data, {
        sportKey: competition.key,
        observedAt: response.observedAt,
      }),
    );
  }

  events.sort(
    (left, right) =>
      left.kickoffAt.localeCompare(right.kickoffAt) || left.eventId.localeCompare(right.eventId),
  );
  const stats = client.getStats();

  return {
    snapshot: {
      schemaVersion: 1,
      generatedAt,
      bookmaker: BOOKMAKER,
      events,
    },
    metadata: {
      competitions: activeCompetitions.map((competition) => competition.key),
      inactiveCompetitions,
      requests: stats.requests - startingRequests,
      eventsReceived,
      eventsPublished: events.length,
      quota: stats.quota,
    },
  };
}
