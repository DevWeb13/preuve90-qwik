import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  new URL("./loto-foot/[formula]/grilles/[id]/index.tsx", import.meta.url),
  "utf8",
);
const dashboardSource = readFileSync(
  new URL("../components/loto-foot/loto-foot-dashboard.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(new URL("../global.css", import.meta.url), "utf8");

describe("présentation de la page de grille", () => {
  it("emploie la nouvelle route pour la canonical et les liens générés", () => {
    expect(pageSource).toContain("getLotoFootGridPath(publication)");
    expect(dashboardSource).toContain("getLotoFootGridPath(settlement.publication)");
  });

  it("présente les résultats officiels dans une bande compacte et régulière", () => {
    const resultStyles = styles.slice(
      styles.indexOf(".official-result-board"),
      styles.indexOf(".section-intro"),
    );

    expect(pageSource).toContain('class="official-result-heading"');
    expect(pageSource).toContain("<time dateTime={result.settledAt}>");
    expect(pageSource).toContain("String(matchResult.position).padStart");
    expect(resultStyles).toContain("grid-template-columns: repeat(auto-fit");
    expect(resultStyles).toContain("min-height: 3.8rem");
    expect(resultStyles).not.toContain("border-radius: 50%");
  });

  it("limite chaque cellule 1, N et 2 à son symbole accessible", () => {
    const selectionCells = pageSource.slice(
      pageSource.indexOf("LOTO_FOOT_SELECTIONS.map((displayedSelection)"),
      pageSource.indexOf(
        "</td>",
        pageSource.indexOf("LOTO_FOOT_SELECTIONS.map((displayedSelection)"),
      ),
    );

    expect(selectionCells).toContain("aria-label=");
    expect(selectionCells).toContain("{symbol.symbol}");
    expect(selectionCells).not.toContain("<small");
  });
});
