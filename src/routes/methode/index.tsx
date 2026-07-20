import { component$ } from "@builder.io/qwik";
import { PageHeader, Panel } from "~/components/ui/primitives";
import { PRODUCT_CONFIG } from "~/config/product";
import { createDocumentHead } from "~/lib/formatting/seo";

const STEPS = [
  [
    "But de l’expérience",
    "Mesurer publiquement la capacité d’une IA à identifier une valeur estimée positive avant des événements sportifs, résultats compris.",
  ],
  [
    "Couverture du scan",
    "The Odds API retourne les événements en direct et les 8 prochains événements tous sports confondus. Preuve90 exclut le direct et choisit uniquement dans ce sous-ensemble ; il ne prétend pas analyser tout Betclic.",
  ],
  [
    "Fenêtre locale",
    "Un candidat doit commencer entre 30 minutes et 8 heures après l’observation, bornes incluses. Les événements déjà commencés sont exclus.",
  ],
  [
    "Marché principal h2h",
    "La sélection correspond exactement à l’une des deux ou trois issues Betclic publiées. Aucun handicap, total, score exact, pari joueur ou combiné n’est accepté.",
  ],
  [
    "Publication préalable",
    "La publication et la cote doivent être horodatées avant le début de l’événement. Toute publication tardive est rejetée.",
  ],
  [
    "Référence fixe",
    `Le bookmaker de référence unique est ${PRODUCT_CONFIG.bookmaker.name}, clé ${PRODUCT_CONFIG.bookmaker.key}.`,
  ],
  [
    "Meilleur candidat du scan",
    "Chaque exécution analyse tous les candidats défendables et peut publier au maximum un pronostic : celui dont la valeur estimée est la meilleure. Zéro publication est un résultat normal et il n’existe aucun plafond journalier.",
  ],
  [
    "Valeur estimée par l’IA",
    "L’espérance estimée vaut probabilité estimée × cote − 1. Elle doit être strictement positive, sans jamais être présentée comme un bénéfice réalisé ou garanti.",
  ],
  [
    "Cote observée immuable",
    "La cote et les noms exacts des issues sont conservés comme chaînes décimales avec l’heure d’observation. La cote ne prouve pas qu’elle aurait été acceptée pour une personne donnée.",
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
    "L’issue gagnante certaine et l’état gagné, perdu ou annulé sont ajoutés dans un autre fichier. Un score générique peut compléter la preuve ; tout résultat ambigu reste en attente.",
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
    `The Odds API est limitée à ${PRODUCT_CONFIG.monthlyApiCreditLimit} crédits mensuels. Le plan futur prévoit quatre scans quotidiens, environ 120 crédits mensuels pour les cotes, sans garantir le coût réel. Les résultats ne sont demandés que pour les pronostics non réglés.`,
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
      description="Des règles explicites rendent chaque observation multisport comparable, vérifiable et honnête sur ses limites."
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
