import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const INVENTORY_PATH = "src/content/loto-foot/inventory.json";
const VALID_SELECTIONS = new Set(["1", "N", "2"]);

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function decodeHtmlEntities(value) {
  const namedEntities = new Map([
    ["nbsp", " "],
    ["euro", "€"],
    ["agrave", "à"],
    ["aacute", "á"],
    ["acirc", "â"],
    ["auml", "ä"],
    ["ccedil", "ç"],
    ["eacute", "é"],
    ["egrave", "è"],
    ["ecirc", "ê"],
    ["euml", "ë"],
    ["icirc", "î"],
    ["iuml", "ï"],
    ["ocirc", "ô"],
    ["ouml", "ö"],
    ["ugrave", "ù"],
    ["ucirc", "û"],
    ["uuml", "ü"],
    ["rsquo", "’"],
    ["lsquo", "‘"],
    ["quot", '"'],
    ["apos", "'"],
    ["amp", "&"],
    ["lt", "<"],
    ["gt", ">"],
  ]);

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(body.slice(2), 16));
    }
    if (body.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(body.slice(1), 10));
    }
    return namedEntities.get(body.toLowerCase()) ?? entity;
  });
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
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findTeamIndex(source, team, fromIndex) {
  const directIndex = source
    .toLocaleLowerCase("fr")
    .indexOf(team.toLocaleLowerCase("fr"), fromIndex);
  if (directIndex >= 0) return directIndex;

  const tokens = team.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (tokens.length === 0) return -1;
  const separator = "(?:\\s|<[^>]+>)+";
  const pattern = new RegExp(tokens.join(separator), "giu");
  pattern.lastIndex = fromIndex;
  return pattern.exec(source)?.index ?? -1;
}

function readAttribute(tag, attributeName) {
  const pattern = new RegExp(
    `(?:^|\\s)${escapeRegExp(attributeName)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function normalizeSelection(value) {
  const normalized = decodeHtmlEntities(value).trim().toUpperCase();
  if (VALID_SELECTIONS.has(normalized)) return normalized;
  const delimited = normalized.match(/(?:^|[^A-Z0-9])(1|N|2)(?:[^A-Z0-9]|$)/u)?.[1];
  return delimited && VALID_SELECTIONS.has(delimited) ? delimited : undefined;
}

function selectionFromTag(tag, followingSource = "") {
  for (const attribute of [
    "value",
    "data-value",
    "data-selection",
    "data-result",
    "data-outcome",
    "aria-label",
    "title",
  ]) {
    const value = readAttribute(tag, attribute);
    const selection = value ? normalizeSelection(value) : undefined;
    if (selection) return selection;
  }

  const adjacentText = decodeHtmlEntities(followingSource)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalizeSelection(adjacentText.slice(0, 20));
}

function isSelectedTag(tag) {
  if (/\schecked(?:\s|=|>|\/)/i.test(tag)) return true;
  if (/\saria-checked\s*=\s*["']?true\b/i.test(tag)) return true;
  if (/\sdata-(?:selected|checked|winner|winning)\s*=\s*["']?(?:true|1|yes)\b/i.test(tag)) {
    return true;
  }
  const className = readAttribute(tag, "class") ?? "";
  return /(?:^|\s)(?:is-)?(?:selected|checked|winner|winning|correct|active)(?:\s|$)/i.test(
    className,
  );
}

function parseSelectionFromSegment(segment) {
  const candidates = [];
  for (const input of segment.matchAll(/<input\b[^>]*>/giu)) {
    if (!isSelectedTag(input[0])) continue;
    const inputEnd = (input.index ?? 0) + input[0].length;
    const following = segment.slice(inputEnd, inputEnd + 160);
    const selection = selectionFromTag(input[0], following);
    if (selection) candidates.push(selection);
  }

  const uniqueInputCandidates = [...new Set(candidates)];
  if (uniqueInputCandidates.length === 1) return uniqueInputCandidates[0];

  const selectedElementPattern =
    /<(?:label|span|button|div)\b([^>]*(?:selected|checked|winner|winning|correct|aria-current)[^>]*)>([\s\S]{0,120}?)<\/(?:label|span|button|div)>/giu;
  const elementCandidates = [];
  for (const element of segment.matchAll(selectedElementPattern)) {
    const text = decodeHtmlEntities(element[2])
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
    const selection = normalizeSelection(text);
    if (selection) elementCandidates.push(selection);
  }
  const uniqueElementCandidates = [...new Set(elementCandidates)];
  if (uniqueElementCandidates.length === 1) return uniqueElementCandidates[0];

  const jsonCandidates = [
    ...segment.matchAll(
      /["'](?:officialSelection|winningSelection|winningChoice|result|selection|outcome)["']\s*:\s*["'](1|N|2)["']/giu,
    ),
  ].map((match) => match[1].toUpperCase());
  const uniqueJsonCandidates = [...new Set(jsonCandidates)];
  return uniqueJsonCandidates.length === 1 ? uniqueJsonCandidates[0] : undefined;
}

function parseGlobalSelections(source, expectedCount) {
  const checkedInputs = [];
  for (const input of source.matchAll(/<input\b[^>]*>/giu)) {
    if (!isSelectedTag(input[0])) continue;
    const inputEnd = (input.index ?? 0) + input[0].length;
    const following = source.slice(inputEnd, inputEnd + 160);
    const selection = selectionFromTag(input[0], following);
    if (selection) checkedInputs.push(selection);
  }
  if (checkedInputs.length === expectedCount) return checkedInputs;

  const jsonSelections = [
    ...source.matchAll(
      /["'](?:officialSelection|winningSelection|winningChoice|result|outcome)["']\s*:\s*["'](1|N|2)["']/giu,
    ),
  ].map((match) => match[1].toUpperCase());
  return jsonSelections.length === expectedCount ? jsonSelections : [];
}

export function parseOfficialSelections(html, matches) {
  const source = decodeHtmlEntities(html);
  const selections = [];
  let cursor = 0;

  for (const match of matches) {
    const homeIndex = findTeamIndex(source, match.homeTeam, cursor);
    if (homeIndex < 0) return [];
    const awayIndex = findTeamIndex(source, match.awayTeam, homeIndex + match.homeTeam.length);
    if (awayIndex < 0) return [];

    const segment = source.slice(homeIndex, awayIndex + match.awayTeam.length);
    const selection = parseSelectionFromSegment(segment);
    if (!selection) {
      return parseGlobalSelections(source, matches.length).map((value, index) => ({
        position: index + 1,
        selection: value,
      }));
    }

    selections.push({ position: match.position, selection });
    cursor = awayIndex + match.awayTeam.length;
  }

  return selections;
}

async function fetchOfficialHtml(officialUrl) {
  const response = await fetch(officialUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Preuve90/1.0",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "fr-FR,fr;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`FDJ a répondu ${response.status} pour ${officialUrl}`);
  return response.text();
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
      const html = await fetchOfficialHtml(publication.officialUrl);
      const payouts = parsePayouts(html);
      if (payouts.length === 0) {
        console.log(`${publication.id} ignorée : rapports FDJ encore indisponibles.`);
        continue;
      }

      const officialMatches = parseOfficialSelections(html, publication.matches);
      if (officialMatches.length !== publication.matches.length) {
        const reason = `${publication.id} : la page FDJ contient les rapports, mais la suite officielle 1/N/2 n’est pas encore exploitable.`;
        blockedReasons.push(reason);
        console.error(reason);
        continue;
      }

      const settledAt = formatParisTimestamp();
      const result = {
        id: `${publication.id}-result`,
        publicationId: publication.id,
        gridNumber: publication.gridNumber,
        settledAt,
        officialUrl: publication.officialUrl,
        matches: officialMatches,
        payouts,
        sources: [
          {
            label: `FDJ - Résultats et rapports officiels Loto Foot ${publication.formula} n°${publication.gridNumber}`,
            url: publication.officialUrl,
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
