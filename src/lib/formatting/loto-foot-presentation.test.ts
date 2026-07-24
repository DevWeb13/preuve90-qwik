import { describe, expect, it } from "vitest";
import {
  LOTO_FOOT_SELECTIONS,
  type LotoFootPublication,
  type LotoFootResult,
} from "~/content/loto-foot/model";
import type { LotoFootPublicationSettlement } from "~/content/loto-foot/settlement";
import {
  formatCorrectAnswerScore,
  getBestTicketPerformance,
  getDashboardPresentation,
  getLotoFootFormulaLabel,
  getNetPresentation,
  getPublicationDetailSections,
  getPublicationDisplayStatus,
  getPublicationStatusLabel,
  getSelectionPresentation,
} from "./loto-foot-presentation";

const publication = {
  validationDeadline: "2026-07-22T18:00:00+02:00",
} as LotoFootPublication;

describe("présentation Loto Foot", () => {
  it("distingue les états ouverte, en attente et réglée avec un libellé explicite", () => {
    const beforeDeadline = new Date("2026-07-22T17:00:00+02:00").getTime();
    const afterDeadline = new Date("2026-07-22T19:00:00+02:00").getTime();

    expect(getPublicationDisplayStatus(publication, undefined, beforeDeadline)).toBe("open");
    expect(getPublicationDisplayStatus(publication, undefined, afterDeadline)).toBe("pending");
    expect(getPublicationDisplayStatus(publication, {} as LotoFootResult, afterDeadline)).toBe(
      "settled",
    );
    expect((["open", "pending", "settled"] as const).map(getPublicationStatusLabel)).toEqual([
      "Ouverte",
      "En attente",
      "Réglée",
    ]);
  });

  it("associe chaque résultat net à un mot et un ton indépendants de la couleur", () => {
    expect(getNetPresentation(100)).toEqual({ label: "Bénéfice", tone: "positive" });
    expect(getNetPresentation(-100)).toEqual({ label: "Perte", tone: "negative" });
    expect(getNetPresentation(0)).toEqual({ label: "Équilibre", tone: "neutral" });
    expect(getNetPresentation(undefined)).toEqual({ label: "En attente", tone: "pending" });
  });

  it("formule les scores et extrait la meilleure performance déjà calculée", () => {
    const settlements = [
      {
        publication: { matches: Array.from({ length: 12 }) } as unknown as LotoFootPublication,
        ticketSettlements: [{ correctSelections: 10 }, { correctSelections: 0 }],
      },
      {
        publication: { matches: Array.from({ length: 15 }) } as unknown as LotoFootPublication,
        ticketSettlements: [{ correctSelections: 13 }],
      },
    ] as unknown as LotoFootPublicationSettlement[];

    expect(getBestTicketPerformance(settlements)).toEqual({
      correctSelections: 13,
      totalSelections: 15,
    });
    expect(formatCorrectAnswerScore(1, 7)).toBe("1 bonne réponse sur 7");
    expect(formatCorrectAnswerScore(10, 12)).toBe("10 bonnes réponses sur 12");
    expect(formatCorrectAnswerScore(13, 15)).toBe("13 bonnes réponses sur 15");
    expect(getLotoFootFormulaLabel(12)).toBe("Loto Foot 12");
  });

  it("présente le bilan terminé avec les mises en attente sans modifier les montants", () => {
    expect(
      getDashboardPresentation(
        {
          publicationCount: 2,
          settledCount: 1,
          pendingStakeCents: 100,
        },
        false,
      ),
    ).toEqual({
      financialState: "settled",
      isEmptyFormula: false,
    });
  });

  it("présente un état d’attente sans résultat net lorsqu’aucune grille n’est terminée", () => {
    expect(
      getDashboardPresentation(
        {
          publicationCount: 2,
          settledCount: 0,
          pendingStakeCents: 500,
        },
        true,
      ),
    ).toEqual({
      financialState: "pending",
      isEmptyFormula: false,
    });
  });

  it("réduit une formule sans publication à son état vide", () => {
    expect(
      getDashboardPresentation(
        {
          publicationCount: 0,
          settledCount: 0,
          pendingStakeCents: 0,
        },
        true,
      ),
    ).toEqual({
      financialState: "empty",
      isEmptyFormula: true,
    });
  });

  it("masque le règlement sans résultat et l’affiche pour une grille réglée", () => {
    expect(getPublicationDetailSections(false)).toEqual({
      financial: false,
      results: false,
      payouts: false,
    });
    expect(getPublicationDetailSections(true)).toEqual({
      financial: true,
      results: true,
      payouts: true,
    });
    expect(getPublicationDetailSections(true)).not.toHaveProperty("comparison");
  });

  it("conserve les colonnes 1, N et 2 et distingue chaque choix sans dépendre de la couleur", () => {
    expect(LOTO_FOOT_SELECTIONS).toEqual(["1", "N", "2"]);
    expect(getSelectionPresentation("1", "1")).toEqual({
      isSelected: true,
      isOfficial: false,
      verdict: undefined,
    });
    expect(getSelectionPresentation("1", "1", "1")).toEqual({
      isSelected: true,
      isOfficial: true,
      verdict: "correct",
    });
    expect(getSelectionPresentation("1", "1", "2")).toEqual({
      isSelected: true,
      isOfficial: false,
      verdict: "incorrect",
    });
    expect(getSelectionPresentation("1", "2", "2")).toEqual({
      isSelected: false,
      isOfficial: true,
      verdict: undefined,
    });
  });
});
