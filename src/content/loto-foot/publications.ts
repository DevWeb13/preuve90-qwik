import type { LotoFootPublication } from "./model";
import { validateLotoFootPublication } from "./validation";

const publicationModules = import.meta.glob("./publications/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

function normalizeHistoricalLotoFootPublication(value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;

  const publication = value as Record<string, unknown>;
  return publication.formula === undefined &&
    typeof publication.id === "string" &&
    publication.id.startsWith("lf7-")
    ? { ...publication, formula: 7 }
    : value;
}

export function loadLotoFootPublications(
  modules: Record<string, unknown> = publicationModules,
): readonly LotoFootPublication[] {
  const publications = Object.entries(modules).map(([path, value]) => {
    try {
      const publication = validateLotoFootPublication(
        normalizeHistoricalLotoFootPublication(value),
      );
      const fileName = path.split("/").at(-1);

      if (fileName !== `${publication.id}.json`) {
        throw new Error("le nom du fichier doit correspondre exactement à publication.id");
      }

      return publication;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "erreur de validation inconnue";
      throw new Error(`Publication Loto Foot invalide (${path}) : ${reason}`);
    }
  });

  const publicationIds = new Set<string>();
  const formulaGridNumbers = new Set<string>();
  publications.forEach(({ formula, gridNumber, id }) => {
    if (publicationIds.has(id)) {
      throw new Error(`Identifiant de publication Loto Foot dupliqué : ${id}`);
    }
    const formulaGridNumber = `${formula}:${gridNumber}`;
    if (formulaGridNumbers.has(formulaGridNumber)) {
      throw new Error(`Grille Loto Foot ${formula} n°${gridNumber} dupliquée`);
    }
    publicationIds.add(id);
    formulaGridNumbers.add(formulaGridNumber);
  });

  return publications.sort(
    (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
  );
}

export const lotoFootPublications = loadLotoFootPublications();

export function getLotoFootPublicationById(
  id: string,
  publications: readonly LotoFootPublication[] = lotoFootPublications,
): LotoFootPublication | undefined {
  return publications.find((publication) => publication.id === id);
}
