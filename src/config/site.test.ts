import { describe, expect, it } from "vitest";
import { SITE_CONFIG } from "./site";

describe("configuration du site", () => {
  it("expose uniquement des routes publiques internes et uniques", () => {
    const routes = SITE_CONFIG.navigation.map(({ href }) => href);

    expect(routes).toEqual([
      "/",
      "/loto-foot/7/",
      "/loto-foot/8/",
      "/loto-foot/12/",
      "/loto-foot/15/",
    ]);
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes.every((route) => route.startsWith("/"))).toBe(true);
  });

  it("garde les liens légaux uniquement dans la navigation du footer", () => {
    expect(SITE_CONFIG.navigation.map(({ label }) => label)).toEqual([
      "Accueil",
      "LF7",
      "LF8",
      "LF12",
      "LF15",
    ]);
    expect(SITE_CONFIG.footerNavigation).toEqual([
      { href: "/mentions-legales/", label: "Mentions légales" },
      { href: "/confidentialite/", label: "Confidentialité" },
    ]);
  });
});
