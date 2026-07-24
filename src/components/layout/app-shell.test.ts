import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isNavigationItemActive } from "~/lib/routing/navigation";

describe("activation du header sur une page de grille", () => {
  const pathname = "/loto-foot/7/grilles/lf7-91-2026-07-22/";
  const componentSource = readFileSync(new URL("./app-shell.tsx", import.meta.url), "utf8");

  it("active LF7 avec la logique commune aux navigations desktop et mobile", () => {
    expect(isNavigationItemActive(pathname, "/loto-foot/7/")).toBe(true);
    expect(isNavigationItemActive(pathname, "/loto-foot/8/")).toBe(false);
    expect(isNavigationItemActive(pathname, "/")).toBe(false);
  });

  it("applique aria-current et la classe active sur desktop et mobile", () => {
    expect(
      componentSource.match(/aria-current=\{isActive\(item\.href\) \? "page" : undefined\}/g),
    ).toHaveLength(2);
    expect(componentSource.match(/active: isActive\(item\.href\)/g)).toHaveLength(2);
  });
});
