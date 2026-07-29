import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const INVENTORY_PATH = "src/content/loto-foot/inventory.json";
const SCORE_CACHE_DIRECTORY = "src/content/loto-foot/score-cache";
const API_BASE_URL = "https://v3.football.api-sports.io";
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);
const HISTORICAL_DATE_WINDOW_DAYS = 4;
const TEAM_STOP_WORDS = new Set([
  "ac",
  "afc",
  "bk",
  "cf",
  "club",
  "de",
  "fc",
  "fk",
  "if",
  "ik",
  "kf",
  "ks",
  "nk",
  "of",
  "sc",
  "sk",
  "the",
  "ue",
]);
const TEAM_ALIASES = new Map([
  ["aik solna", "aik"],
  ["aik stockholm", "aik"],
  ["agf aarhus", "agf aarhus"],
  ["aarhus gf", "agf aarhus"],
  ["crvena zvezda", "red star belgrade"],
  ["etoile rouge", "red star belgrade"],
  ["red star belgrade", "red star belgrade"],
  ["hap beer sheva", "hapoel beer sheva"],
  ["hapoel beer sheva", "hapoel beer sheva"],
  ["heart midlothian", "heart midlothian"],
  ["hearts", "heart midlothian"],
  ["iberia 1999", "iberia 1999"],
  ["saburtalo", "iberia 1999"],
  ["kauno zalgiris", "zalgiris kaunas"],
  ["zalgiris kaunas", "zalgiris kaunas"],
  ["polessya", "polissya zhytomyr"],
  ["polissya", "polissya zhytomyr"],
  ["polissya zhytomyr", "polissya zhytomyr"],
  ["slo bratislava", "slovan bratislava"],
  ["slovan bratislava", "slovan bratislava"],
  ["uni craiova", "craiova"],
  ["universitatea craiova", "craiova"],
  ["zhytomyr", "polissya zhytomyr"],
]);

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export function normalizeTeamName(value) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bst[.]?\b/g, "saint")
    .replace(/\bind[.]?\b/g, "independiente")
    .replace(/\batl[.]?\b/g, "atletico")
    .replace(/\bbodo\b/g, "bodo")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !TEAM_STOP_WORDS.has(token))
    .join(" ");

  return TEAM_ALIASES.get(normalized) ?? normalized;
}

function levenshteinDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

export function teamSimilarity(leftValue, rightValue) {
  const left = normalizeTeamName(leftValue);
  const right = normalizeTeamName(rightValue);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.94;

  const leftTokens = new Set(left.split(" "));
  const rightTokens = new Set(right.split(" "));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  const jaccard = union === 0 ? 0 : intersection / union;
  const maxLength = Math.max(left.length, right.length);
  const editSimilarity =
    maxLength === 0 ? 1 : 1 - levenshteinDistance(left, right) / maxLength;
  return Math.max(jaccard, editSimilarity * 0.9);
}

function fixtureDateInParis(isoTimestamp) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoTimestamp));
}

export function fixtureDatesForMatch(match, validationDeadline) {
  if (match.startsAt) return [fixtureDateInParis(match.startsAt)];

  const deadline = Date.parse(validationDeadline);
  return Array.from({ length: HISTORICAL_DATE_WINDOW_DAYS }, (_, index) =>
    fixtureDateInParis(new Date(deadline + index * 86_400_000).toISOString()),
  );
}

function formatParisTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const offset = values.timeZoneName.replace("GMT", "");
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}${offset}`;
}

export function isApiDateUnavailableError(error) {
  const message = errorMessage(error).toLowerCase();
  return (
    message.includes("free plans do not have access to this date") ||
    message.includes("do not have access to this date")
  );
}

async function fetchJson(url, apiKey) {
  const response = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
  });
  if (!response.ok) throw new Error(`API-Football a répondu ${response.status} pour ${url}`);
  const payload = await response.json();
  if (payload.errors && Object.keys(payload.errors).length > 0) {
    throw new Error(`API-Football : ${JSON.stringify(payload.errors)}`);
  }
  return payload.response ?? [];
}

async function fetchFixturesByDate(date, apiKey) {
  const url = new URL("/fixtures", API_BASE_URL);
  url.searchParams.set("date", date);
  url.searchParams.set("timezone", "Europe/Paris");
  return fetchJson(url, apiKey);
}

async function fetchFixturesByDateSafely(date, apiKey) {
  try {
    return await fetchFixturesByDate(date, apiKey);
  } catch (error) {
    if (!isApiDateUnavailableError(error)) throw error;
    console.log(`${date} ignorée : date hors de la fenêtre du forfait API-Football.`);
    return [];
  }
}

function rankFixtureCandidates(match, fixtures) {
  const expectedStart = match.startsAt ? Date.parse(match.startsAt) : undefined;
  return fixtures
    .map((fixture) => {
      const homeScore = teamSimilarity(match.homeTeam, fixture.teams?.home?.name ?? "");
      const awayScore = teamSimilarity(match.awayTeam, fixture.teams?.away?.name ?? "");
      const start = Date.parse(fixture.fixture?.date ?? "");
      const timeDifferenceHours =
        Number.isFinite(expectedStart) && Number.isFinite(start)
          ? Math.abs(start - expectedStart) / 3_600_000
          : 0;
      const timeScore = timeDifferenceHours <= 1 ? 1 : timeDifferenceHours <= 6 ? 0.7 : 0;
      return {
        fixture,
        score: homeScore * 0.45 + awayScore * 0.45 + timeScore * 0.1,
        homeScore,
        awayScore,
        timeDifferenceHours,
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function findFixture(match, fixtures) {
  const ranked = rankFixtureCandidates(match, fixtures).filter(
    ({ homeScore, awayScore, timeDifferenceHours }) =>
      homeScore >= 0.55 && awayScore >= 0.55 && timeDifferenceHours <= 8,
  );

  if (ranked.length === 0 || ranked[0].score < 0.68) return undefined;
  if (ranked[1] && ranked[0].score - ranked[1].score < 0.06) return undefined;
  return ranked[0].fixture;
}

function fixtureCandidateSummary(match, fixtures) {
  return rankFixtureCandidates(match, fixtures)
    .slice(0, 3)
    .map(({ fixture, homeScore, awayScore, timeDifferenceHours }) => {
      const home = fixture.teams?.home?.name ?? "?";
      const away = fixture.teams?.away?.name ?? "?";
      return `${home} - ${away} (dom. ${homeScore.toFixed(2)}, ext. ${awayScore.toFixed(2)}, écart ${timeDifferenceHours.toFixed(1)} h)`;
    })
    .join(" | ");
}

export function cachedMatchFromFixture(match, fixture, capturedAt = formatParisTimestamp()) {
  const status = fixture.fixture?.status?.short;
  if (!FINAL_STATUSES.has(status)) return undefined;
  const homeScore = fixture.score?.fulltime?.home;
  const awayScore = fixture.score?.fulltime?.away;
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) return undefined;

  return {
    position: match.position,
    selection: homeScore > awayScore ? "1" : homeScore === awayScore ? "N" : "2",
    homeScore,
    awayScore,
    fixtureId: fixture.fixture?.id,
    fixtureDate: fixture.fixture?.date,
    capturedAt,
  };
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&euro;|&#8364;|\u20ac/gi, "€")
    .replace(/&agrave;|&#224;/gi, "à")
    .replace(/&eacute;|&#233;/gi, "é")
    .replace(/&egrave;|&#232;/gi, "è")
    .replace(/&rsquo;|&#8217;/gi, "’")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&amp;|&#38;/gi, "&");
}

function parseFrenchAmountCents(value) {
  const normalized = value.replace(/[\s.\u00a0\u202f]/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return Math.round(amount * 100);
}

export function parsePayouts(html) {
  const text = decodeHtmlEntities(
    html
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\\n|\\r|\\t/g, " ")
      .replace(/\s+/g, " "),
  );
  const payouts = new Map();
  const tablePattern =
    /(\d+)\s+sur\s+\d+\s+\d[\d\s.]*?\s+(\d{1,3}(?:[\s.\u00a0\u202f]\d{3})*,\d{2})\s*(?:€|euros?)/giu;
  for (const match of text.matchAll(tablePattern)) {
    const correctSelections = Number.parseInt(match[1], 10);
    const amountCents = parseFrenchAmountCents(match[2]);
    if (Number.isInteger(correctSelections) && amountCents !== undefined) {
      payouts.set(correctSelections, { correctSelections, amountCents });
    }
  }

  const reportPattern =
    /\d[\d\s.]*\s+gagnants?\s+(?:à|avec)\s+(\d+)\s*(?:\/\s*\d+|bons?\s+r[ée]sultats?)/giu;
  const reports = [...text.matchAll(reportPattern)];

  reports.forEach((report, index) => {
    const segmentStart = (report.index ?? 0) + report[0].length;
    const segmentEnd = reports[index + 1]?.index ?? Math.min(text.length, segmentStart + 180);
    const segment = text.slice(segmentStart, segmentEnd);
    const amountMatch = segment.match(
      /(?:pour|remportent?|gagnent?|rapport(?:ent)?)[^\d]{0,30}([\d][\d\s.,]*)\s*(?:€|euros?)/iu,
    );
    const correctSelections = Number.parseInt(report[1], 10);
    const amountCents = amountMatch ? parseFrenchAmountCents(amountMatch[1]) : undefined;
    if (Number.isInteger(correctSelections) && amountCents !== undefined) {
      payouts.set(correctSelections, { correctSelections, amountCents });
    }
  });

  if (payouts.size === 0) {
    const fallbackPattern =
      /(\d+)\s*\/\s*\d+.{0,100}?(?:rapport|gain|pour)[^\d]{0,30}([\d][\d\s.,]*)\s*(?:€|euros?)/giu;
    for (const match of text.matchAll(fallbackPattern)) {
      const correctSelections = Number.parseInt(match[1], 10);
      const amountCents = parseFrenchAmountCents(match[2]);
      if (Number.isInteger(correctSelections) && amountCents !== undefined) {
        payouts.set(correctSelections, { correctSelections, amountCents });
      }
    }
  }

  return [...payouts.values()].sort(
    (left, right) => right.correctSelections - left.correctSelections,
  );
}

async function fetchPayouts(officialUrl) {
  const response = await fetch(officialUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Preuve90/1.0",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "fr-FR,fr;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`FDJ a répondu ${response.status} pour ${officialUrl}`);
  const html = await response.text();
  return parsePayouts(html);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function scoreCacheRelativePath(publicationId) {
  return `${SCORE_CACHE_DIRECTORY}/${publicationId}.json`;
}

async function loadScoreCache(rootDirectory, publication) {
  const relativePath = scoreCacheRelativePath(publication.id);
  const absolutePath = path.join(rootDirectory, relativePath);
  if (!(await fileExists(absolutePath))) {
    return {
      relativePath,
      value: { version: 1, publicationId: publication.id, matches: [] },
    };
  }

  const value = JSON.parse(await readFile(absolutePath, "utf8"));
  if (value.publicationId !== publication.id || !Array.isArray(value.matches)) {
    throw new Error(`Cache de scores invalide pour ${publication.id}.`);
  }
  return { relativePath, value };
}

function canonicalCacheValue(publicationId, matches, capturedAt) {
  return {
    version: 1,
    publicationId,
    capturedAt,
    matches: [...matches].sort((left, right) => left.position - right.position),
  };
}

async function capturePublicationScores({
  rootDirectory,
  publication,
  apiKey,
  fixtureCache,
}) {
  const cache = await loadScoreCache(rootDirectory, publication);
  const cachedByPosition = new Map(cache.value.matches.map((match) => [match.position, match]));
  const missingMatches = publication.matches.filter(
    (match) => !cachedByPosition.has(match.position),
  );

  const dates = [
    ...new Set(
      missingMatches.flatMap((match) =>
        fixtureDatesForMatch(match, publication.validationDeadline),
      ),
    ),
  ];

  for (const date of dates) {
    if (!fixtureCache.has(date)) {
      fixtureCache.set(date, await fetchFixturesByDateSafely(date, apiKey));
    }
  }

  const capturedAt = formatParisTimestamp();
  let changed = false;
  const unmatched = [];
  const unfinished = [];

  for (const match of missingMatches) {
    const fixtures = fixtureDatesForMatch(match, publication.validationDeadline).flatMap(
      (date) => fixtureCache.get(date) ?? [],
    );
    const fixture = findFixture(match, fixtures);
    if (!fixture) {
      unmatched.push({ match, candidates: fixtureCandidateSummary(match, fixtures) });
      continue;
    }

    const cachedMatch = cachedMatchFromFixture(match, fixture, capturedAt);
    if (!cachedMatch) {
      unfinished.push(match);
      continue;
    }

    cachedByPosition.set(match.position, cachedMatch);
    changed = true;
  }

  const nextValue = canonicalCacheValue(
    publication.id,
    [...cachedByPosition.values()],
    changed ? capturedAt : cache.value.capturedAt,
  );

  if (changed) {
    await mkdir(path.join(rootDirectory, SCORE_CACHE_DIRECTORY), { recursive: true });
    await writeFile(
      path.join(rootDirectory, cache.relativePath),
      `${JSON.stringify(nextValue, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `${publication.id} : ${nextValue.matches.length}/${publication.matches.length} scores conservés.`,
    );
  }

  return { cache: nextValue, unmatched, unfinished };
}

function buildBlockedReason(publication, captured) {
  const cachedPositions = new Set(captured.cache.matches.map(({ position }) => position));
  const missing = publication.matches.filter(({ position }) => !cachedPositions.has(position));
  const details = missing.map((match) => {
    const unmatched = captured.unmatched.find(
      ({ match: candidate }) => candidate.position === match.position,
    );
    if (unmatched) {
      return `${match.homeTeam} - ${match.awayTeam}${unmatched.candidates ? ` ; meilleurs candidats : ${unmatched.candidates}` : " ; aucun candidat accessible"}`;
    }
    return `${match.homeTeam} - ${match.awayTeam} ; résultat final indisponible`;
  });
  return `${publication.id} : ${missing.length} résultat(s) manquant(s) : ${details.join(" || ")}`;
}

async function settlePendingPublications({ rootDirectory, apiKey }) {
  const inventory = JSON.parse(await readFile(path.join(rootDirectory, INVENTORY_PATH), "utf8"));
  const pendingPaths = [...(inventory.pendingPublications ?? [])];
  const publications = await Promise.all(
    pendingPaths.map(async (relativePath) => ({
      relativePath,
      publication: JSON.parse(await readFile(path.join(rootDirectory, relativePath), "utf8")),
    })),
  );
  publications.sort(
    (left, right) =>
      Date.parse(left.publication.validationDeadline) -
      Date.parse(right.publication.validationDeadline),
  );

  const fixtureCache = new Map();
  const blockedReasons = [];
  const settledPublications = [];

  for (const { relativePath, publication } of publications) {
    if (Date.now() < Date.parse(publication.validationDeadline)) continue;
    const resultRelativePath = relativePath.replace("/publications/", "/results/");
    if (await fileExists(path.join(rootDirectory, resultRelativePath))) continue;

    const captured = await capturePublicationScores({
      rootDirectory,
      publication,
      apiKey,
      fixtureCache,
    });

    const payouts = await fetchPayouts(publication.officialUrl);
    if (payouts.length === 0) {
      console.log(`${publication.id} ignorée : rapports FDJ introuvables dans la page officielle.`);
      continue;
    }

    if (captured.cache.matches.length !== publication.matches.length) {
      const blockedReason = buildBlockedReason(publication, captured);
      blockedReasons.push(blockedReason);
      console.error(blockedReason);
      continue;
    }

    const settledAt = formatParisTimestamp();
    const result = {
      id: `${publication.id}-result`,
      publicationId: publication.id,
      gridNumber: publication.gridNumber,
      settledAt,
      officialUrl: publication.officialUrl,
      matches: captured.cache.matches.map(
        ({ position, selection, homeScore, awayScore }) => ({
          position,
          selection,
          homeScore,
          awayScore,
        }),
      ),
      payouts,
      sources: [
        {
          label: `FDJ - Résultats et rapports officiels Loto Foot ${publication.formula} n°${publication.gridNumber}`,
          url: publication.officialUrl,
          accessedAt: settledAt,
        },
        {
          label: "API-Football - Résultats finaux conservés à la fin des rencontres",
          url: "https://www.api-football.com/",
          accessedAt: settledAt,
        },
      ],
    };

    await writeFile(
      path.join(rootDirectory, resultRelativePath),
      `${JSON.stringify(result, null, 2)}\n`,
      "utf8",
    );
    settledPublications.push(publication.id);
    console.log(`Règlement créé : ${resultRelativePath}`);
  }

  return { blockedReasons, settledPublications };
}

async function run() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) throw new Error("Le secret API_FOOTBALL_KEY est absent.");
  const outcome = await settlePendingPublications({
    rootDirectory: process.cwd(),
    apiKey,
  });

  console.log(`SETTLED_COUNT=${outcome.settledPublications.length}`);
  console.log(`BLOCKED_COUNT=${outcome.blockedReasons.length}`);
  for (const reason of outcome.blockedReasons) console.log(`BLOCKED_REASON=${reason}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(errorMessage(error));
    process.exitCode = 1;
  });
}
