import { LOTO_FOOT_MATCH_COUNTS, LOTO_FOOT_SELECTIONS, type LotoFootPublication } from "./model";

type UnknownRecord = Record<string, unknown>;

const LOTO_FOOT_METHOD_VERSIONS = ["loto-foot-v1", "v1"] as const;

function fail(path: string, message: string): never {
  throw new Error(`${path} : ${message}`);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): UnknownRecord {
  if (!isRecord(value)) fail(path, "doit être un objet");
  return value;
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

function requireOptionalNonEmptyString(value: unknown, path: string): void {
  if (value !== undefined) requireNonEmptyString(value, path);
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

function validateProbability(value: unknown, path: string): void {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 100) {
    fail(path, "doit être un entier compris entre 0 et 100");
  }
}

function validateSource(value: unknown, path: string, publishedAt: number): void {
  const source = requireRecord(value, path);
  requireNonEmptyString(source.label, `${path}.label`);
  requireHttpUrl(source.url, `${path}.url`);
  const accessedAt = requireTimestamp(source.accessedAt, `${path}.accessedAt`);
  if (accessedAt > publishedAt) {
    fail(`${path}.accessedAt`, "ne peut pas être postérieure à publication.publishedAt");
  }
}

function validateMatch(value: unknown, index: number, publishedAt: number): void {
  const path = `matches[${index}]`;
  const match = requireRecord(value, path);

  requireNonEmptyString(match.homeTeam, `${path}.homeTeam`);
  requireNonEmptyString(match.awayTeam, `${path}.awayTeam`);
  requireOptionalNonEmptyString(match.competition, `${path}.competition`);
  if (match.startsAt !== undefined) requireTimestamp(match.startsAt, `${path}.startsAt`);

  const probabilities = requireRecord(match.probabilities, `${path}.probabilities`);
  validateProbability(probabilities.home, `${path}.probabilities.home`);
  validateProbability(probabilities.draw, `${path}.probabilities.draw`);
  validateProbability(probabilities.away, `${path}.probabilities.away`);

  if (
    (probabilities.home as number) +
      (probabilities.draw as number) +
      (probabilities.away as number) !==
    100
  ) {
    fail(`${path}.probabilities`, "la somme de home, draw et away doit être égale à 100");
  }

  const analysis = requireRecord(match.analysis, `${path}.analysis`);
  requireNonEmptyString(analysis.summary, `${path}.analysis.summary`);
  requireNonEmptyString(analysis.uncertainty, `${path}.analysis.uncertainty`);

  const keyFactors = requireArray(analysis.keyFactors, `${path}.analysis.keyFactors`);
  if (keyFactors.length === 0)
    fail(`${path}.analysis.keyFactors`, "doit contenir au moins un élément");
  keyFactors.forEach((factor, factorIndex) =>
    requireNonEmptyString(factor, `${path}.analysis.keyFactors[${factorIndex}]`),
  );

  const sources = requireArray(analysis.sources, `${path}.analysis.sources`);
  if (sources.length === 0) fail(`${path}.analysis.sources`, "doit contenir au moins une source");
  sources.forEach((source, sourceIndex) =>
    validateSource(source, `${path}.analysis.sources[${sourceIndex}]`, publishedAt),
  );
}

export function validateLotoFootPublication(value: unknown): LotoFootPublication {
  const publication = requireRecord(value, "publication");

  requireNonEmptyString(publication.id, "publication.id");
  if (!Number.isInteger(publication.gridNumber) || (publication.gridNumber as number) <= 0) {
    fail("publication.gridNumber", "doit être un entier positif");
  }
  requireHttpUrl(publication.officialUrl, "publication.officialUrl");
  const methodVersion = requireNonEmptyString(
    publication.methodVersion,
    "publication.methodVersion",
  );
  if (!(LOTO_FOOT_METHOD_VERSIONS as readonly string[]).includes(methodVersion)) {
    fail("publication.methodVersion", "doit valoir loto-foot-v1 ou v1");
  }

  const publishedAt = requireTimestamp(publication.publishedAt, "publication.publishedAt");
  const validationDeadline = requireTimestamp(
    publication.validationDeadline,
    "publication.validationDeadline",
  );
  if (publishedAt >= validationDeadline) {
    fail("publication.publishedAt", "doit être strictement antérieure à validationDeadline");
  }

  const matches = requireArray(publication.matches, "publication.matches");
  if (!(LOTO_FOOT_MATCH_COUNTS as readonly number[]).includes(matches.length)) {
    fail("publication.matches", "doit contenir exactement 6 ou 7 matchs");
  }

  const positions = matches.map((match) => requireRecord(match, "match").position);
  const invalidPositions = positions.filter(
    (position) =>
      !Number.isInteger(position) ||
      (position as number) < 1 ||
      (position as number) > matches.length,
  );
  const missingPositions = Array.from({ length: matches.length }, (_, index) => index + 1).filter(
    (position) => !positions.includes(position),
  );
  const duplicatedPositions = positions.filter(
    (position, index) => positions.indexOf(position) !== index,
  );

  if (
    invalidPositions.length > 0 ||
    missingPositions.length > 0 ||
    duplicatedPositions.length > 0
  ) {
    const reasons = [
      invalidPositions.length > 0
        ? `chaque position doit être un entier compris entre 1 et ${matches.length}`
        : "",
      missingPositions.length > 0 ? `position(s) ${missingPositions.join(", ")} absente(s)` : "",
      duplicatedPositions.length > 0
        ? `position(s) ${[...new Set(duplicatedPositions)].join(", ")} dupliquée(s)`
        : "",
    ].filter(Boolean);
    fail("publication.matches", reasons.join(" ; "));
  }

  positions.forEach((position, index) => {
    if (position !== index + 1) {
      fail(
        "publication.matches",
        `les positions doivent être ordonnées exactement de 1 à ${matches.length}`,
      );
    }
  });
  matches.forEach((match, index) => validateMatch(match, index, publishedAt));

  const tickets = requireArray(publication.tickets, "publication.tickets");
  if (tickets.length === 0) fail("publication.tickets", "doit contenir au moins une combinaison");

  const ticketIds = new Set<string>();
  const selectionSequences = new Set<string>();

  tickets.forEach((value, index) => {
    const path = `publication.tickets[${index}]`;
    const ticket = requireRecord(value, path);
    const id = requireNonEmptyString(ticket.id, `${path}.id`);
    requireNonEmptyString(ticket.label, `${path}.label`);
    requireNonEmptyString(ticket.rationale, `${path}.rationale`);

    if (ticketIds.has(id)) fail(`${path}.id`, "doit être unique dans la publication");
    ticketIds.add(id);

    const selections = requireArray(ticket.selections, `${path}.selections`);
    if (selections.length !== matches.length) {
      fail(
        `${path}.selections`,
        `doit contenir exactement ${matches.length} choix, comme la publication contient de matchs`,
      );
    }
    selections.forEach((selection, selectionIndex) => {
      if (
        typeof selection !== "string" ||
        !(LOTO_FOOT_SELECTIONS as readonly string[]).includes(selection)
      ) {
        fail(`${path}.selections[${selectionIndex}]`, "doit valoir 1, N ou 2");
      }
    });

    const sequence = selections.join("");
    if (selectionSequences.has(sequence)) {
      fail(`${path}.selections`, "ne peut pas dupliquer une autre combinaison");
    }
    selectionSequences.add(sequence);
  });

  return publication as unknown as LotoFootPublication;
}
