import { LOTO_FOOT_SELECTIONS, type LotoFootPublication, type LotoFootResult } from "./model";

type UnknownRecord = Record<string, unknown>;

function fail(path: string, message: string): never {
  throw new Error(`${path} : ${message}`);
}

function requireRecord(value: unknown, path: string): UnknownRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "doit être un objet");
  }
  return value as UnknownRecord;
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, "doit être un tableau");
  return value;
}

function requireNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(path, "doit être une chaîne non vide");
  }
  return value;
}

function requireHttpUrl(value: unknown, path: string): void {
  const urlValue = requireNonEmptyString(value, path);
  let url: URL;

  try {
    url = new URL(urlValue);
  } catch {
    fail(path, "doit être une URL valide");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    fail(path, "doit utiliser le protocole HTTP ou HTTPS");
  }
}

function requireTimestamp(value: unknown, path: string): number {
  const timestampValue = requireNonEmptyString(value, path);
  const timestamp = Date.parse(timestampValue);

  if (!timestampValue.includes("T") || !Number.isFinite(timestamp)) {
    fail(path, "doit être une date et heure valides");
  }
  return timestamp;
}

function requireNonNegativeInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    fail(path, "doit être un entier positif ou nul");
  }
  return value as number;
}

export function validateLotoFootResult(
  value: unknown,
  publications: readonly LotoFootPublication[],
): LotoFootResult {
  const result = requireRecord(value, "result");
  requireNonEmptyString(result.id, "result.id");
  const publicationId = requireNonEmptyString(result.publicationId, "result.publicationId");
  const publication = publications.find(({ id }) => id === publicationId);

  if (!publication) fail("result.publicationId", "ne correspond à aucune publication");
  if (result.gridNumber !== publication.gridNumber) {
    fail("result.gridNumber", "doit être identique au numéro de la publication");
  }

  const settledAt = requireTimestamp(result.settledAt, "result.settledAt");
  if (settledAt < Date.parse(publication.validationDeadline)) {
    fail("result.settledAt", "ne peut pas être antérieur à la clôture de la grille");
  }
  requireHttpUrl(result.officialUrl, "result.officialUrl");

  const matches = requireArray(result.matches, "result.matches");
  if (matches.length !== publication.matches.length) {
    fail(
      "result.matches",
      `doit contenir exactement ${publication.matches.length} résultats, comme la publication contient de matchs`,
    );
  }

  matches.forEach((value, index) => {
    const path = `result.matches[${index}]`;
    const match = requireRecord(value, path);
    if (match.position !== index + 1) {
      fail(
        `${path}.position`,
        `doit être l’entier ${index + 1} afin que les positions soient uniques et ordonnées`,
      );
    }
    if (
      typeof match.selection !== "string" ||
      !(LOTO_FOOT_SELECTIONS as readonly string[]).includes(match.selection)
    ) {
      fail(`${path}.selection`, "doit valoir 1, N ou 2");
    }

    const hasHomeScore = match.homeScore !== undefined;
    const hasAwayScore = match.awayScore !== undefined;
    if (hasHomeScore !== hasAwayScore) {
      fail(path, "doit fournir les deux scores ou aucun score");
    }
    if (hasHomeScore) {
      requireNonNegativeInteger(match.homeScore, `${path}.homeScore`);
      requireNonNegativeInteger(match.awayScore, `${path}.awayScore`);
    }
  });

  const payouts = requireArray(result.payouts, "result.payouts");
  if (payouts.length === 0) fail("result.payouts", "doit contenir au moins un rapport officiel");
  const payoutLevels = new Set<number>();
  payouts.forEach((value, index) => {
    const path = `result.payouts[${index}]`;
    const payout = requireRecord(value, path);
    const correctSelections = requireNonNegativeInteger(
      payout.correctSelections,
      `${path}.correctSelections`,
    );
    if (correctSelections > publication.matches.length) {
      fail(
        `${path}.correctSelections`,
        `ne peut pas dépasser ${publication.matches.length}, le nombre de matchs de la grille`,
      );
    }
    if (payoutLevels.has(correctSelections)) {
      fail(`${path}.correctSelections`, "doit être unique dans les rapports officiels");
    }
    payoutLevels.add(correctSelections);
    requireNonNegativeInteger(payout.amountCents, `${path}.amountCents`);
  });

  const sources = requireArray(result.sources, "result.sources");
  if (sources.length === 0) fail("result.sources", "doit contenir au moins une source officielle");
  sources.forEach((value, index) => {
    const path = `result.sources[${index}]`;
    const source = requireRecord(value, path);
    requireNonEmptyString(source.label, `${path}.label`);
    requireHttpUrl(source.url, `${path}.url`);
    requireTimestamp(source.accessedAt, `${path}.accessedAt`);
  });

  return result as unknown as LotoFootResult;
}
