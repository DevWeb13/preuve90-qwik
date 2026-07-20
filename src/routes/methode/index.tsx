import { component$ } from "@builder.io/qwik";
import { PageHeader, Panel } from "~/components/ui/primitives";
import { PRODUCT_CONFIG } from "~/config/product";
import { createDocumentHead } from "~/lib/formatting/seo";

const STEPS = [
  [
    "But de l’expérience",
    "Mesurer publiquement la capacité d’une IA à produire des pronostics football avant les matchs, résultats compris.",
  ],
  [
    "Sélection des matchs",
    "L’automatisation pourra choisir zéro ou un match pertinent par jour. Une absence de publication vaut mieux qu’une donnée incertaine.",
  ],
  [
    "Marché 1N2",
    "La sélection est exclusivement 1 (domicile), N (nul) ou 2 (extérieur). Aucun combiné n’est accepté.",
  ],
  [
    "Temps réglementaire",
    "Le résultat est celui observé après le temps réglementaire, hors prolongation et tirs au but.",
  ],
  [
    "Publication préalable",
    "La publication et la cote doivent être horodatées avant le coup d’envoi. Toute publication tardive est rejetée.",
  ],
  [
    "Référence fixe",
    `Le bookmaker de référence unique est ${PRODUCT_CONFIG.bookmaker.name}, clé ${PRODUCT_CONFIG.bookmaker.key}.`,
  ],
  [
    "Cote observée",
    "La cote est conservée comme chaîne décimale exacte avec son heure d’observation. Elle ne prouve pas qu’elle aurait été acceptée pour une personne donnée.",
  ],
  [
    "Mise virtuelle",
    "Chaque publication simule exactement 5,00 EUR. Aucun argent réel n’est placé ou transféré.",
  ],
  [
    "Immutabilité",
    "Une publication rejoint Git comme un fait versionné. Elle n’est jamais supprimée, antidatée ou réécrite après le résultat.",
  ],
  [
    "Règlement séparé",
    "Le score final et l’état gagné, perdu ou annulé sont ajoutés dans un autre fichier. L’absence de règlement produit l’état en attente.",
  ],
  [
    "Statistiques dérivées",
    "Retours, résultat net, taux de réussite et rendement sont recalculés depuis les faits. Aucune statistique pré-calculée n’est stockée.",
  ],
  [
    "Limites de l’IA",
    "Un modèle peut mal interpréter un signal, ignorer une information ou produire une conclusion incorrecte. L’historique expose ces erreurs.",
  ],
  [
    "Budget de source",
    `The Odds API est limitée à ${PRODUCT_CONFIG.monthlyApiCreditLimit} crédits mensuels. Les futurs robots devront grouper les appels et tracer le coût.`,
  ],
  [
    "Aucun pari réel",
    "Preuve90 ne possède ni compte joueur, ni portefeuille, ni dépôt, ni bouton de pari, ni lien commercial vers un bookmaker.",
  ],
  [
    "Aucune garantie",
    "Un résultat passé, positif ou négatif, ne prédit pas les résultats futurs et ne constitue pas un conseil financier.",
  ],
] as const;

export default component$(() => (
  <div class="route-stack method-page">
    <PageHeader
      eyebrow="PROTOCOLE OUVERT"
      title="Comment fonctionne Preuve90 ?"
      description="Quinze règles simples rendent chaque observation comparable, vérifiable et honnête sur ses limites."
    />
    <ol class="method-steps">
      {STEPS.map(([title, description], index) => (
        <li key={title}>
          <span class="step-number">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </li>
      ))}
    </ol>
    <Panel class="method-warning">
      <span class="eyebrow">LIMITE ESSENTIELLE</span>
      <h2>Une expérience n’est pas une recommandation.</h2>
      <p>
        Les jeux d’argent comportent des risques financiers et d’addiction et sont interdits aux
        mineurs. Preuve90 n’aide pas à placer un pari réel.
      </p>
    </Panel>
  </div>
));

export const head = createDocumentHead(
  "Méthode et protocole",
  "Découvrez les règles de publication, d’immutabilité, de règlement et de calcul de l’expérience Preuve90.",
  "/methode/",
);
