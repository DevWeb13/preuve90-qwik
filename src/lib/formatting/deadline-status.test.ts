import { describe, expect, it } from "vitest";
import { formatDeadlineDuration, getDeadlineStatus } from "./deadline-status";

describe("statut de clôture", () => {
  it("formate les durées sans secondes", () => {
    expect(formatDeadlineDuration(45 * 60_000)).toBe("45 minutes");
    expect(formatDeadlineDuration((3 * 60 + 5) * 60_000)).toBe("3 heures et 5 minutes");
    expect(formatDeadlineDuration((2 * 24 * 60 + 3 * 60 + 4) * 60_000)).toBe(
      "2 jours, 3 heures et 4 minutes",
    );
  });

  it("indique le temps restant avant la clôture", () => {
    expect(
      getDeadlineStatus(
        "2026-07-24T18:45:00+02:00",
        new Date("2026-07-24T18:00:00+02:00"),
      ),
    ).toEqual({
      phase: "before",
      duration: "45 minutes",
      primary: "Clôture dans 45 minutes",
    });
  });

  it("indique le temps écoulé et l’attente des résultats après la clôture", () => {
    expect(
      getDeadlineStatus(
        "2026-07-23T14:55:00+02:00",
        new Date("2026-07-24T18:00:00+02:00"),
      ),
    ).toEqual({
      phase: "after",
      duration: "1 jour, 3 heures et 5 minutes",
      primary: "Grille clôturée depuis 1 jour, 3 heures et 5 minutes",
      secondary: "Résultats officiels en attente",
    });
  });
});
