import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("fil d’Ariane", () => {
  const componentSource = readFileSync(new URL("./breadcrumbs.tsx", import.meta.url), "utf8");
  const gridPageSource = readFileSync(
    new URL("../../routes/loto-foot/[formula]/grilles/[id]/index.tsx", import.meta.url),
    "utf8",
  );
  const dashboardSource = readFileSync(
    new URL("../loto-foot/loto-foot-dashboard.tsx", import.meta.url),
    "utf8",
  );

  it("déclare une navigation à liste ordonnée avec un niveau courant", () => {
    expect(componentSource).toContain('aria-label="Fil d’Ariane"');
    expect(componentSource).toContain("<ol>");
    expect(componentSource).toContain('aria-current={isCurrent ? "page" : undefined}');
    expect(componentSource).toContain("<Link");
  });

  it("compose la hiérarchie Accueil, formule et grille sur le détail", () => {
    expect(gridPageSource).toContain('{ label: "Accueil", href: "/" }');
    expect(gridPageSource).toContain(
      "{ label: formulaLabel, href: `/loto-foot/${publication.formula}/` }",
    );
    expect(gridPageSource).toContain("{ label: `Grille ${publication.gridNumber}` }");
  });

  it("compose uniquement Accueil et la formule sur les pages de formule", () => {
    expect(dashboardSource).toContain(
      '<Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: formulaLabel }]} />',
    );
  });
});
