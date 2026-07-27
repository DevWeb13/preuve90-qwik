import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const INVENTORY_PATH = "src/content/loto-foot/inventory.json";
const API_BASE_URL = "https://v3.football.api-sports.io";
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);
const TEAM_STOP_WORDS = new Set(["fc", "fk", "cf", "sc", "ac", "club", "de", "the"]);

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function normalizeTeamName(value) {
  return value
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

function teamSimilarity(leftValue, rightValue) {
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
  const editSimilarity = maxLength === 0 ? 1 : 1 - levenshteinDistance(left, right) / maxLength;
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

function findFixture(match, fixtures) {
  const expectedStart = match.startsAt ? Date.parse(match.startsAt) : undefined;
  const ranked = fixtures
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
    .filter(
      ({ homeScore, awayScore, timeDifferenceHours }) =>
        homeScore >= 0.55 && awayScore >= 0.55 && timeDifferenceHours <= 8,
    )
    .sort((left, right) => right.score - left.score);

  if (ranked.length === 0 || ranked[0].score < 0.68) return undefined;
  if (ranked[1] && ranked[0].score - ranked[1].score < 0.06) return undefined;
  return ranked[0].fixture;
}

function resultSelection(fixture) {
  const status = fixture.fixture?.status?.short;
  if (!FINAL_STATUSES.has(status)) return undefined;
  const home = fixture.score?.fulltime?.home;
  const away = fixture.score?.fulltime?.away;
  if (!Number.isInteger(home) || !Number.isInteger(away)) return undefined;
  return home > away ? "1" : home === away ? "N" : "2";
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
  const tablePattern = /(\d+)\s+sur\s+\d+\s+\d[\d\s.]*?\s+(\d{1,3}(?:[\s.\u00a0\u202f]\d{3})*,\d{2})\s*(?:€|euros?)/giu;
  for (const match of text.matchAll(tablePattern)) {
    const correctSelections = Number.parseInt(match[1], 10);
    const amountCents = parseFrenchAmountCents(match[2]);
    if (Number.isInteger(correctSelections) && amountCents !== undefined) {
      payouts.set(correctSelections, { correctSelections, amountCents });
    }
  }

  const reportPattern = /\d[\d\s.]*\s+gagnants?\s+(?:à|avec)\s+(\d+)\s*(?:\/\s*\d+|bons?\s+r[ée]sultats?)/giu;
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
    const fallbackPattern = /(\d+)\s*\/\s*\d+.{0,100}?(?:rapport|gain|pour)[^\d]{0,30}([\d][\d\s.,]*)\s*(?:€|euros?)/giu;
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

async function settleOldestEligiblePublication({ rootDirectory, apiKey }) {
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
      Date.parse(left.publication.validationDeadline) - Date.parse(right.publication.validationDeadline),
  );

  for (const { relativePath, publication } of publications) {
    if (Date.now() < Date.parse(publication.validationDeadline)) continue;
    const resultRelativePath = relativePath.replace("/publications/", "/results/");
    if (await fileExists(path.join(rootDirectory, resultRelativePath))) continue;

    const dates = [
      ...new Set(
        publication.matches.map((match) =>
          fixtureDateInParis(match.startsAt ?? publication.validationDeadline),
        ),
      ),
    ];
    const fixtureCache = new Map();
    for (const date of dates) fixtureCache.set(date, await fetchFixturesByDate(date, apiKey));

    const matchedFixtures = [];
    let blockedReason;
    for (const match of publication.matches) {
      const date = fixtureDateInParis(match.startsAt ?? publication.validationDeadline);
      const fixture = findFixture(match, fixtureCache.get(date) ?? []);
      if (!fixture) {
        blockedReason = `rencontre introuvable sans ambiguïté : ${match.homeTeam} - ${match.awayTeam}`;
        break;
      }
      const selection = resultSelection(fixture);
      if (!selection) {
        blockedReason = `résultat final indisponible : ${match.homeTeam} - ${match.awayTeam}`;
        break;
      }
      matchedFixtures.push({ match, fixture, selection });
    }
    if (blockedReason) {
      console.log(`${publication.id} ignorée : ${blockedReason}.`);
      continue;
    }

    const payouts = await fetchPayouts(publication.officialUrl);
    if (payouts.length === 0) {
      console.log(`${publication.id} ignorée : rapports FDJ introuvables dans la page officielle.`);
      continue;
    }

    const settledAt = formatParisTimestamp();
    const result = {
      id: `${publication.id}-result`,
      publicationId: publication.id,
      gridNumber: publication.gridNumber,
      settledAt,
      officialUrl: publication.officialUrl,
      matches: matchedFixtures.map(({ match, selection }) => ({
        position: match.position,
        selection,
      })),
      payouts,
      sources: [
        {
          label: `FDJ - Résultats et rapports officiels Loto Foot ${publication.formula} n°${publication.gridNumber}`,
          url: publication.officialUrl,
          accessedAt: settledAt,
        },
        {
          label: "API-Football - Résultats finaux des rencontres",
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
    console.log(`RESULT_PATH=${resultRelativePath}`);
    console.log(`RESULT_ID=${publication.id}`);
    return { resultRelativePath, publicationId: publication.id };
  }

  console.log("Aucun règlement automatique réalisable.");
  return undefined;
}

async function run() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) throw new Error("Le secret API_FOOTBALL_KEY est absent.");
  await settleOldestEligiblePublication({ rootDirectory: process.cwd(), apiKey });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(errorMessage(error));
    process.exitCode = 1;
  });
}
