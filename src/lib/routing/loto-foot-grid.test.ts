import { describe, expect, it } from "vitest";
import {
  getLotoFootGridPath,
  parseLotoFootFormula,
  resolveLotoFootGridPublication,
} from "./loto-foot-grid";

describe("routage des pages de grille Loto Foot", () => {
  it("résout la nouvelle URL d’une publication LF7", () => {
    const publication = resolveLotoFootGridPublication("lf7-91-2026-07-22", "7");

    expect(publication?.formula).toBe(7);
    expect(publication && getLotoFootGridPath(publication)).toBe(
      "/loto-foot/7/grilles/lf7-91-2026-07-22/",
    );
  });

  it("résout la nouvelle URL d’une publication LF8", () => {
    const publication = resolveLotoFootGridPublication("lf8-96-2026-07-25", "8");

    expect(publication?.formula).toBe(8);
    expect(publication && getLotoFootGridPath(publication)).toBe(
      "/loto-foot/8/grilles/lf8-96-2026-07-25/",
    );
  });

  it("refuse une publication inexistante ou une formule incompatible", () => {
    expect(resolveLotoFootGridPublication("publication-inexistante", "7")).toBeUndefined();
    expect(resolveLotoFootGridPublication("lf7-91-2026-07-22", "8")).toBeUndefined();
    expect(resolveLotoFootGridPublication("lf7-91-2026-07-22", "invalide")).toBeUndefined();
  });

  it("valide uniquement les formules prises en charge", () => {
    expect(parseLotoFootFormula("7")).toBe(7);
    expect(parseLotoFootFormula("8")).toBe(8);
    expect(parseLotoFootFormula("12")).toBe(12);
    expect(parseLotoFootFormula("15")).toBe(15);
    expect(parseLotoFootFormula("9")).toBeUndefined();
  });

  it("génère le chemin unique utilisé par les liens et la canonical", () => {
    const path = getLotoFootGridPath({
      formula: 7,
      id: "lf7-91-2026-07-22",
    });

    expect(path).toBe("/loto-foot/7/grilles/lf7-91-2026-07-22/");
    expect(path.split("/")).toEqual([
      "",
      "loto-foot",
      "7",
      "grilles",
      "lf7-91-2026-07-22",
      "",
    ]);
  });
});
