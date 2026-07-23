import { describe, expect, it } from "vitest";
import type { LotoFootPublication, LotoFootResult } from "~/content/loto-foot/model";
import type { LotoFootPublicationSettlement } from "~/content/loto-foot/settlement";
import {
  formatCorrectAnswerScore,
  getBestTicketPerformance,
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
  });

  it("formule les scores et extrait la meilleure performance déjà calculée", () => {
    const settlements = [
      {
        publication: { matches: Array.from({ length: 7 }) } as unknown as LotoFootPublication,
        ticketSettlements: [{ correctSelections: 2 }, { correctSelections: 0 }],
      },
      {
        publication: { matches: Array.from({ length: 6 }) } as unknown as LotoFootPublication,
        ticketSettlements: [{ correctSelections: 1 }],
      },
    ] as unknown as LotoFootPublicationSettlement[];

    expect(getBestTicketPerformance(settlements)).toEqual({
      correctSelections: 2,
      totalSelections: 7,
    });
    expect(formatCorrectAnswerScore(1, 7)).toBe("1 bonne réponse sur 7");
    expect(formatCorrectAnswerScore(2, 7)).toBe("2 bonnes réponses sur 7");
  });
});
