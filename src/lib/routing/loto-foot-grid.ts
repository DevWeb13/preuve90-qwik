import {
  LOTO_FOOT_FORMULAS,
  type LotoFootFormula,
  type LotoFootPublication,
} from "~/content/loto-foot/model";
import {
  getLotoFootPublicationById,
  lotoFootPublications,
} from "~/content/loto-foot/publications";

export function parseLotoFootFormula(value: string): LotoFootFormula | undefined {
  const formula = Number(value);

  return LOTO_FOOT_FORMULAS.find((availableFormula) => availableFormula === formula);
}

export function getLotoFootGridPath(
  publication: Pick<LotoFootPublication, "formula" | "id">,
): string {
  return `/loto-foot/${publication.formula}/grilles/${encodeURIComponent(publication.id)}/`;
}

export function resolveLotoFootGridPublication(
  id: string,
  formulaParam: string,
  publications: readonly LotoFootPublication[] = lotoFootPublications,
): LotoFootPublication | undefined {
  const publication = getLotoFootPublicationById(id, publications);
  const formula = parseLotoFootFormula(formulaParam);

  return publication && formula === publication.formula ? publication : undefined;
}
