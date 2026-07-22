import { describe, expect, it } from "vitest";
import { SITE_CONFIG } from "./site";

describe("configuration du site", () => {
  it("expose uniquement des routes publiques internes et uniques", () => {
    const routes = SITE_CONFIG.navigation.map(({ href }) => href);

    expect(routes).toEqual(["/", "/mentions-legales/", "/confidentialite/"]);
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes.every((route) => route.startsWith("/"))).toBe(true);
  });
});
