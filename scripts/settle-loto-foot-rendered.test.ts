import { describe, expect, it, vi } from "vitest";
import { resolveOfficialResultUrl } from "./settle-loto-foot-rendered.mjs";

describe("résolution des pages de résultats FDJ", () => {
  it("conserve une URL permanente sans consulter l'index", async () => {
    const fetchImpl = vi.fn();
    const officialUrl =
      "https://www.pointdevente.parionssport.fdj.fr/grilles/loto-foot/loto-foot-7/4913";

    await expect(
      resolveOfficialResultUrl(
        {
          formula: 7,
          gridNumber: 96,
          officialUrl,
        },
        fetchImpl,
      ),
    ).resolves.toBe(officialUrl);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("retrouve l'URL permanente depuis l'index des résultats", async () => {
    const html = `
      <section>
        <a href="/grilles/loto-foot/loto-foot-7/4913">
          LF 7 N°96 fin de valid. 02/08 16h25
        </a>
        <a href="/grilles/loto-foot/loto-foot-12/557">
          LF 12 N°65 fin de valid. 02/08 16h25
        </a>
      </section>
    `;
    const fetchImpl = vi.fn(async () => new Response(html, { status: 200 }));

    await expect(
      resolveOfficialResultUrl(
        {
          formula: 12,
          gridNumber: 65,
          officialUrl:
            "https://www.pointdevente.parionssport.fdj.fr/grilles/ouvertes/loto-foot",
        },
        fetchImpl,
      ),
    ).resolves.toBe(
      "https://www.pointdevente.parionssport.fdj.fr/grilles/loto-foot/loto-foot-12/557",
    );
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("ne choisit pas une autre grille de la même formule", async () => {
    const html = `
      <a href="/grilles/loto-foot/loto-foot-12/556">
        LF 12 N°64 fin de valid. 29/07 18h55
      </a>
    `;
    const fetchImpl = vi.fn(async () => new Response(html, { status: 200 }));

    await expect(
      resolveOfficialResultUrl(
        {
          formula: 12,
          gridNumber: 65,
          officialUrl:
            "https://www.pointdevente.parionssport.fdj.fr/grilles/ouvertes/loto-foot",
        },
        fetchImpl,
      ),
    ).resolves.toBeUndefined();
  });
});
