import type { LotoFootPublication, LotoFootResult } from "~/content/loto-foot/model";
import type { LotoFootPublicationSettlement } from "~/content/loto-foot/settlement";

export type PublicationDisplayStatus = "open" | "pending" | "settled";
export type FinancialTone = "positive" | "negative" | "neutral";

export function getPublicationDisplayStatus(
  publication: LotoFootPublication,
  result?: LotoFootResult,
  now = Date.now(),
): PublicationDisplayStatus {
  if (result) return "settled";
  return new Date(publication.validationDeadline).getTime() > now ? "open" : "pending";
}

export function getPublicationStatusLabel(status: PublicationDisplayStatus): string {
  if (status === "settled") return "Réglée";
  if (status === "open") return "Ouverte";
  return "En attente";
}

export function getNetPresentation(netCents: number): {
  label: "Bénéfice" | "Perte" | "Équilibre";
  tone: FinancialTone;
} {
  if (netCents > 0) return { label: "Bénéfice", tone: "positive" };
  if (netCents < 0) return { label: "Perte", tone: "negative" };
  return { label: "Équilibre", tone: "neutral" };
}

export function formatCorrectAnswerScore(correct: number, total: number): string {
  return `${correct} ${correct === 1 ? "bonne réponse" : "bonnes réponses"} sur ${total}`;
}

export function getBestTicketPerformance(
  settlements: readonly LotoFootPublicationSettlement[],
): { correctSelections: number; totalSelections: number } | undefined {
  return settlements.reduce<{ correctSelections: number; totalSelections: number } | undefined>(
    (best, settlement) =>
      settlement.ticketSettlements.reduce((ticketBest, ticketSettlement) => {
        const candidate = {
          correctSelections: ticketSettlement.correctSelections,
          totalSelections: settlement.publication.matches.length,
        };

        if (!ticketBest) return candidate;
        const candidateRatio = candidate.correctSelections / candidate.totalSelections;
        const bestRatio = ticketBest.correctSelections / ticketBest.totalSelections;
        return candidateRatio > bestRatio ||
          (candidateRatio === bestRatio &&
            candidate.correctSelections > ticketBest.correctSelections)
          ? candidate
          : ticketBest;
      }, best),
    undefined,
  );
}
