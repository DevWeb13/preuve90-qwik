import type { PredictionStatus } from "~/types/prediction";

export interface ParsedDecimal {
  numerator: bigint;
  denominator: bigint;
}

const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.(\d{1,4}))?$/;

export function parseDecimal(value: string): ParsedDecimal {
  const match = DECIMAL_PATTERN.exec(value);

  if (!match) {
    throw new Error(`Valeur décimale invalide : ${value}`);
  }

  const fraction = match[1] ?? "";
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(value.replace(".", ""));

  return { numerator, denominator };
}

export function parseDecimalOdds(value: string): ParsedDecimal {
  const parsed = parseDecimal(value);

  if (parsed.numerator <= parsed.denominator) {
    throw new Error("Une cote décimale doit être strictement supérieure à 1.");
  }

  return parsed;
}

export function multiplyCentsByDecimal(cents: number, decimal: string): number {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new Error("Le montant en centimes doit être un entier positif sûr.");
  }

  const { numerator, denominator } = parseDecimalOdds(decimal);
  const rounded = (BigInt(cents) * numerator + denominator / 2n) / denominator;
  const result = Number(rounded);

  if (!Number.isSafeInteger(result)) {
    throw new Error("Le résultat dépasse la plage des entiers sûrs.");
  }

  return result;
}

export function getRealizedReturnCents(
  status: PredictionStatus,
  virtualStakeCents: number,
  recordedOdds: string,
): number | null {
  switch (status) {
    case "WON":
      return multiplyCentsByDecimal(virtualStakeCents, recordedOdds);
    case "LOST":
      return 0;
    case "VOID":
      return virtualStakeCents;
    case "PENDING":
      return null;
  }
}
