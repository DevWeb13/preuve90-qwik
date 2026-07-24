import type {
  LotoFootFormula,
  LotoFootPublication,
  LotoFootResult,
  LotoFootSelection,
} from "~/content/loto-foot/model";
import type { LotoFootPublicationSettlement } from "~/content/loto-foot/settlement";

export type PublicationDisplayStatus = "open" | "pending" | "settled";
export type FinancialTone = "positive" | "negative" | "neutral" | "pending";
export type DashboardFinancialState = "settled" | "pending" | "empty";

export interface DashboardPresentation {
  financialState: DashboardFinancialState;
  isEmptyFormula: boolean;
}

export interface PublicationDetailSections {
  financial: boolean;
  results: boolean;
  payouts: boolean;
}

export type SelectionSymbolState =
  | "empty"
  | "published"
  | "official"
  | "correct"
  | "incorrect";

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

export function getNetPresentation(netCents?: number): {
  label: "Bénéfice" | "Perte" | "Équilibre" | "En attente";
  tone: FinancialTone;
} {
  if (netCents === undefined) return { label: "En attente", tone: "pending" };
  if (netCents > 0) return { label: "Bénéfice", tone: "positive" };
  if (netCents < 0) return { label: "Perte", tone: "negative" };
  return { label: "Équilibre", tone: "neutral" };
}

export function formatCorrectAnswerScore(correct: number, total: number): string {
  return `${correct} ${correct === 1 ? "bonne réponse" : "bonnes réponses"} sur ${total}`;
}

export function getLotoFootFormulaLabel(formula: LotoFootFormula): string {
  return `Loto Foot ${formula}`;
}

export function getDashboardPresentation(
  statistics: {
    publicationCount: number;
    settledCount: number;
    pendingStakeCents: number;
  },
  isFormulaPage: boolean,
): DashboardPresentation {
  return {
    financialState:
      statistics.settledCount > 0
        ? "settled"
        : statistics.pendingStakeCents > 0
          ? "pending"
          : "empty",
    isEmptyFormula: isFormulaPage && statistics.publicationCount === 0,
  };
}

export function getPublicationDetailSections(hasResult: boolean): PublicationDetailSections {
  return {
    financial: hasResult,
    results: hasResult,
    payouts: hasResult,
  };
}

export function getSelectionPresentation(
  publishedSelection: LotoFootSelection,
  displayedSelection: LotoFootSelection,
  officialSelection?: LotoFootSelection,
): {
  isSelected: boolean;
  isOfficial: boolean;
  verdict?: "correct" | "incorrect";
} {
  const isSelected = publishedSelection === displayedSelection;
  const isOfficial = officialSelection === displayedSelection;

  return {
    isSelected,
    isOfficial,
    verdict:
      officialSelection === undefined || !isSelected
        ? undefined
        : publishedSelection === officialSelection
          ? "correct"
          : "incorrect",
  };
}

export function getSelectionSymbolPresentation(selection: {
  isSelected: boolean;
  isOfficial: boolean;
  verdict?: "correct" | "incorrect";
}): { state: SelectionSymbolState; symbol: "○" | "●" | "◎" | "✓" | "×" } {
  if (selection.verdict === "correct") return { state: "correct", symbol: "✓" };
  if (selection.verdict === "incorrect") return { state: "incorrect", symbol: "×" };
  if (selection.isOfficial) return { state: "official", symbol: "◎" };
  if (selection.isSelected) return { state: "published", symbol: "●" };
  return { state: "empty", symbol: "○" };
}

export function getMatchVerdictLabel(
  publishedSelection: LotoFootSelection,
  officialSelection?: LotoFootSelection,
): string | undefined {
  if (officialSelection === undefined) return undefined;
  return publishedSelection === officialSelection
    ? "Choix correct"
    : `Choix incorrect · Résultat officiel : ${officialSelection}`;
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
