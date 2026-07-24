import { describe, expect, it } from "vitest";
import type { LotoFootPublication, LotoFootResult } from "~/content/loto-foot/model";
import type { LotoFootPublicationSettlement } from "~/content/loto-foot/settlement";
import {
  formatCorrectAnswerScore,
  getBestTicketPerformance,
  getLotoFootFormulaLabel,
  getNetPresentation,
  getPublicationDisplayStatus,
  getPublicationStatusLabel,
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
});
