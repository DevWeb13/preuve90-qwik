import type { LotoFootPublication, LotoFootResult } from "./model";
import { lotoFootPublications } from "./publications";
import { validateLotoFootResult } from "./result-validation";

const resultModules = import.meta.glob("./results/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

export function loadLotoFootResults(
  modules: Record<string, unknown> = resultModules,
  publications: readonly LotoFootPublication[] = lotoFootPublications,
): readonly LotoFootResult[] {
  const results = Object.entries(modules).map(([path, value]) => {
    try {
      return validateLotoFootResult(value, publications);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "erreur de validation inconnue";
      throw new Error(`Résultat Loto Foot invalide (${path}) : ${reason}`);
    }
  });

  const resultIds = new Set<string>();
  const publicationIds = new Set<string>();
  results.forEach((result) => {
    if (resultIds.has(result.id)) {
      throw new Error(`Identifiant de résultat Loto Foot dupliqué : ${result.id}`);
    }
    if (publicationIds.has(result.publicationId)) {
      throw new Error(
        `Plusieurs résultats pour la publication Loto Foot : ${result.publicationId}`,
      );
    }
    resultIds.add(result.id);
    publicationIds.add(result.publicationId);
  });

  return results.sort((left, right) => Date.parse(right.settledAt) - Date.parse(left.settledAt));
}

export const lotoFootResults = loadLotoFootResults();

export function getLotoFootResultByPublicationId(
  publicationId: string,
  results: readonly LotoFootResult[] = lotoFootResults,
): LotoFootResult | undefined {
  return results.find((result) => result.publicationId === publicationId);
}
