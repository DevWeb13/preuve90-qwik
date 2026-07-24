# Preuve90

Preuve90 publie avant leur date limite des analyses et des combinaisons virtuelles pour les grilles Loto Foot 7, 8, 12 et 15, puis les compare aux résultats et rapports officiels.

Chaque publication conserve la formule, le numéro de grille, les matchs dans leur ordre officiel, les probabilités et sources de l’analyse, ainsi qu’une ou plusieurs combinaisons de même longueur composées de `1`, `N` ou `2`.

Une combinaison représente une mise strictement virtuelle de 1 EUR. Les mises, retours, résultats nets et statistiques sont calculés automatiquement depuis les fichiers de contenu. Aucun argent réel n’est joué, les pronostics peuvent être faux et aucun gain n’est garanti.

## Formules prises en charge

- Loto Foot 7 : 6 ou 7 matchs ;
- Loto Foot 8 : 7 ou 8 matchs ;
- Loto Foot 12 : 9 à 12 matchs ;
- Loto Foot 15 : 12 à 15 matchs.

## Expérience publique

La page d’accueil présente :

- le bilan des grilles terminées ;
- les mises encore en attente dans un encart séparé ;
- les performances calculées depuis les grilles réglées ;
- les accès aux quatre formules ;
- toutes les grilles publiées.

Une page de formule reprend uniquement les données de la formule choisie. Une formule sans publication affiche un état vide simple.

Une page de grille distingue deux états principaux :

- avant le règlement : clôture, combinaisons publiées, analyses et sources ;
- après le règlement : bilan virtuel, résultats, rapports officiels et verdict de chaque choix.

Les combinaisons sont affichées comme des grilles accessibles à colonnes `1`, `N` et `2`. Le temps restant avant la clôture, ou écoulé depuis celle-ci, est calculé sans estimer l’heure de publication des résultats.

## Routes publiques

- `/` : vue d’ensemble, bilan et grilles publiées ;
- `/loto-foot/7/`, `/loto-foot/8/`, `/loto-foot/12/`, `/loto-foot/15/` : vues par formule ;
- `/grille/[id]/` : détail d’une publication et de son éventuel règlement ;
- `/mentions-legales/` : mentions légales ;
- `/confidentialite/` : politique de confidentialité ;
- toute autre URL renvoie une page 404 cohérente.

## Socle technique

- Qwik et Qwik City avec TypeScript strict ;
- rendu serveur et adaptateur Vercel Edge ;
- ESLint et Prettier ;
- Vitest ;
- GSAP chargé côté client uniquement pour les animations utiles.

Les publications et résultats sont des fichiers JSON distincts, validés et chargés au build. Aucune base de données ni route d’administration n’est nécessaire.

## Contenu Loto Foot

- publications : `src/content/loto-foot/publications/` ;
- résultats officiels : `src/content/loto-foot/results/` ;
- inventaire généré : `src/content/loto-foot/inventory.json` ;
- modèle, validation et calculs : `src/content/loto-foot/`.

## Installation

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

`ORIGIN` configure l’origine utilisée par Qwik City. `PUBLIC_ORIGIN` est facultative et permet de produire des URL canoniques absolues.

## Commandes

```bash
npm run fmt
npm run fmt.check
npm run lint
npm run build.types
npm run test:run
npm run build
npm run check:typography
npm run check
```

`npm run check:typography` refuse les caractères U+2013 et U+2014 dans les fichiers textuels suivis par Git.

`npm run check` vérifie successivement la typographie, le formatage, le lint, les types, les tests et le build de production.

## Documentation

- règles de travail de Codex : `AGENTS.md` ;
- référence de l’interface : `docs/DESIGN.md` ;
- décisions techniques actives : `docs/architecture/DECISIONS.md` ;
- procédure de publication et de règlement planifiés : `docs/automations/preuve90.md`.
