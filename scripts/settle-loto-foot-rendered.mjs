import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseOfficialSelections, parsePayouts } from "./settle-loto-foot.mjs";

const INVENTORY_PATH = "src/content/loto-foot/inventory.json";
const RESULTS_INDEX_URL =
  "https://www.pointdevente.parionssport.fdj.fr/grilles/resultats/loto-foot";
const FDJ_HOST = "www.pointdevente.parionssport.fdj.fr";
const NEUTRALIZED_SELECTION = "G";

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readAttribute(tag, attributeName) {
  const pattern = new RegExp(
    `(?:^|\\s)${escapeRegExp(attributeName)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function decodeHtmlText(value) {
  const namedEntities = new Map([
    ["amp", "&"],
    ["deg", "°"],
    ["nbsp", " "],
    ["ordm", "º"],
    ["quot", '"'],
    ["eacute", "é"],
    ["egrave", "è"],
    ["agrave", "à"],
    ["ccedil", "ç"],
    ["rsquo", "’"],
  ]);

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/giu, (entity, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(body.slice(2), 16));
    }
    if (body.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(body.slice(1), 10));
    }
    return namedEntities.get(body.toLowerCase()) ?? entity;
  });
}

function pageText(html) {
  return decodeHtmlText(
    html
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
      .replace(/<[^>]+>/gu, " ")
      .replace(/\s+/gu, " "),
  ).trim();
}

function normalizeComparableText(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr")
    .replace(/\s+/gu, " ")
    .trim();
}

function findMatchTextSegment(html, match) {
  const text = normalizeComparableText(pageText(html));
  const homeTeam = normalizeComparableText(match.homeTeam);
  const awayTeam = normalizeComparableText(match.awayTeam);
  const homeIndex = text.indexOf(homeTeam);
  if (homeIndex < 0) return undefined;
  const awayIndex = text.indexOf(awayTeam, homeIndex + homeTeam.length);
  if (awayIndex < 0) return undefined;
  return text.slice(homeIndex, awayIndex + awayTeam.length);
}

function isExplicitlyNeutralized(html, match) {
  const segment = findMatchTextSegment(html, match);
  return segment ? /\bgagnant\b/u.test(segment) : false;
}

function parseReportShape(html) {
  const text = pageText(html);
  const rows = [...text.matchAll(/\b(\d+)\s+sur\s+(\d+)\b/giu)].map((match) => ({
    correctSelections: Number.parseInt(match[1], 10),
    reportedMatchCount: Number.parseInt(match[2], 10),
  }));
  if (rows.length === 0) return undefined;

  const reportedMatchCounts = [...new Set(rows.map(({ reportedMatchCount }) => reportedMatchCount))];
  if (reportedMatchCounts.length !== 1) return undefined;

  return {
    reportedMatchCount: reportedMatchCounts[0],
    highestCorrectSelections: Math.max(...rows.map(({ correctSelections }) => correctSelections)),
  };
}

export function parseRenderedOfficialResults(html, matches) {
  const reportShape = parseReportShape(html);
  if (!reportShape) return [];

  const results = [];
  const unresolved = [];

  for (const match of matches) {
    const parsed = parseOfficialSelections(html, [match]);
    if (parsed.length === 1) {
      results.push({ position: match.position, selection: parsed[0].selection });
      continue;
    }

    if (isExplicitlyNeutralized(html, match)) {
      results.push({ position: match.position, selection: NEUTRALIZED_SELECTION });
      continue;
    }

    unresolved.push(match);
  }

  if (unresolved.length === 0) {
    return results.sort((left, right) => left.position - right.position);
  }

  const resolvedCount = results.length;
  const inferredNeutralizedCount = matches.length - reportShape.reportedMatchCount;
  const canInferNeutralizedMatches =
    reportShape.highestCorrectSelections === matches.length &&
    reportShape.reportedMatchCount === resolvedCount &&
    inferredNeutralizedCount > 0 &&
    unresolved.length === inferredNeutralizedCount;

  if (!canInferNeutralizedMatches) return [];

  for (const match of unresolved) {
    results.push({ position: match.position, selection: NEUTRALIZED_SELECTION });
  }

  return results.sort((left, right) => left.position - right.position);
}

export function isDedicatedOfficialUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.hostname === FDJ_HOST &&
      /^\/grilles\/loto-foot\/loto-foot-(?:7|8|12|15)\/\d+\/?$/u.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function findOfficialResultUrl(html, publication) {
  const formulaPath = `/grilles/loto-foot/loto-foot-${publication.formula}/`;
  const gridPattern = new RegExp(
    `(?:LF|LOTO\\s+FOOT)\\s*${publication.formula}\\s*N\\s*[°º]?\\s*${publication.gridNumber}\\b`,
    "iu",
  );

  for (const anchor of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/giu)) {
    const href = readAttribute(anchor[0], "href");
    if (!href) continue;

    let candidate;
    try {
      candidate = new URL(href, RESULTS_INDEX_URL);
    } catch {
      continue;
    }

    if (
      candidate.hostname !== FDJ_HOST ||
      !candidate.pathname.startsWith(formulaPath) ||
      !isDedicatedOfficialUrl(candidate.href)
    ) {
      continue;
    }

    const label = decodeHtmlText(anchor[0])
      .replace(/<[^>]+>/gu, " ")
      .replace(/\s+/gu, " ")
      .trim();
    if (gridPattern.test(label)) return candidate.href;
  }

  return undefined;
}

export async function resolveOfficialResultUrl(publication, fetchImpl = fetch) {
  if (isDedicatedOfficialUrl(publication.officialUrl)) {
    return publication.officialUrl;
  }

  const response = await fetchImpl(RESULTS_INDEX_URL);
  if (!response.ok) {
    throw new Error(`FDJ a répondu ${response.status} pour ${RESULTS_INDEX_URL}`);
  }

  return findOfficialResultUrl(await response.text(), publication);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
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

async function settlePendingPublications({ rootDirectory }) {
  const inventory = JSON.parse(
    await readFile(path.join(rootDirectory, INVENTORY_PATH), "utf8"),
  );
  const pendingPaths = [...(inventory.pendingPublications ?? [])];
  const publications = await Promise.all(
    pendingPaths.map(async (relativePath) => ({
      relativePath,
      publication: JSON.parse(
        await readFile(path.join(rootDirectory, relativePath), "utf8"),
      ),
    })),
  );
  publications.sort(
    (left, right) =>
      Date.parse(left.publication.validationDeadline) -
      Date.parse(right.publication.validationDeadline),
  );

  const blockedReasons = [];
  const settledPublications = [];

  for (const { relativePath, publication } of publications) {
    if (Date.now() < Date.parse(publication.validationDeadline)) continue;
    const resultRelativePath = relativePath.replace("/publications/", "/results/");
    if (await fileExists(path.join(rootDirectory, resultRelativePath))) continue;

    try {
      const officialResultUrl = await resolveOfficialResultUrl(publication);
      if (!officialResultUrl) {
        console.log(
          `${publication.id} ignorée : page de résultat FDJ encore indisponible.`,
        );
        continue;
      }

      const response = await fetch(officialResultUrl);
      if (!response.ok) {
        throw new Error(`FDJ a répondu ${response.status}`);
      }
      const html = await response.text();
      const payouts = parsePayouts(html);
      if (payouts.length === 0) {
        console.log(`${publication.id} ignorée : rapports FDJ encore indisponibles.`);
        continue;
      }

      const officialMatches = parseRenderedOfficialResults(html, publication.matches);
      if (officialMatches.length !== publication.matches.length) {
        const reason = `${publication.id} : la page FDJ contient les rapports, mais ${publication.matches.length} résultats officiels complets ou neutralisés n’ont pas été identifiés sans ambiguïté.`;
        blockedReasons.push(reason);
        console.error(reason);
        continue;
      }

      const neutralizedPositions = officialMatches
        .filter(({ selection }) => selection === NEUTRALIZED_SELECTION)
        .map(({ position }) => position);
      if (neutralizedPositions.length > 0) {
        console.log(
          `${publication.id} : rencontre(s) neutralisée(s) FDJ détectée(s) aux positions ${neutralizedPositions.join(", ")}.`,
        );
      }

      const settledAt = formatParisTimestamp();
      const result = {
        id: `${publication.id}-result`,
        publicationId: publication.id,
        gridNumber: publication.gridNumber,
        settledAt,
        officialUrl: officialResultUrl,
        matches: officialMatches,
        payouts,
        sources: [
          {
            label: `FDJ - Résultats et rapports officiels Loto Foot ${publication.formula} n°${publication.gridNumber}`,
            url: officialResultUrl,
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
    } catch (error) {
      const reason = `${publication.id} : consultation FDJ impossible (${errorMessage(error)}).`;
      blockedReasons.push(reason);
      console.error(reason);
    }
  }

  return { blockedReasons, settledPublications };
}

async function run() {
  const outcome = await settlePendingPublications({ rootDirectory: process.cwd() });
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
