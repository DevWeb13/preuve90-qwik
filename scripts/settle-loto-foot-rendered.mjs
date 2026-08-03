import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parsePayouts } from "./settle-loto-foot.mjs";

const INVENTORY_PATH = "src/content/loto-foot/inventory.json";
const RESULTS_INDEX_URL =
  "https://www.pointdevente.parionssport.fdj.fr/grilles/resultats/loto-foot";
const FDJ_HOST = "www.pointdevente.parionssport.fdj.fr";
const SELECTION_BY_CONTROL = new Map([
  ["one", "1"],
  ["n", "N"],
  ["two", "2"],
  ["1", "1"],
  ["N", "N"],
  ["2", "2"],
]);

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

export function isDedicatedOfficialUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.hostname === FDJ_HOST &&
      /^\/grilles\/loto-foot\/loto-foot-(?:7|8|12|15)\/\d+\/?$/u.test(
        url.pathname,
      )
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

function isCheckedInput(tag) {
  return /\schecked(?:\s|=|>|\/)/iu.test(tag);
}

export function parseRenderedOfficialSelections(html, expectedCount) {
  const selections = [];
  for (const input of html.matchAll(/<input\b[^>]*>/giu)) {
    if (!isCheckedInput(input[0])) continue;
    const rawSelection =
      readAttribute(input[0], "value") ??
      readAttribute(input[0], "formcontrolname");
    const selection = rawSelection
      ? SELECTION_BY_CONTROL.get(rawSelection.trim())
      : undefined;
    if (selection) selections.push(selection);
  }

  if (selections.length !== expectedCount) return [];
  return selections.map((selection, index) => ({
    position: index + 1,
    selection,
  }));
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

      const officialMatches = parseRenderedOfficialSelections(
        html,
        publication.matches.length,
      );
      if (officialMatches.length !== publication.matches.length) {
        const reason = `${publication.id} : la page FDJ contient les rapports, mais ${publication.matches.length} résultats 1/N/2 complets n’ont pas été détectés.`;
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
