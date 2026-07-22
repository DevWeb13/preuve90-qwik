# Preuve90

Preuve90 publie avant leur date limite des analyses et des combinaisons virtuelles pour les grilles Loto Foot 7, puis les règle depuis les résultats et rapports officiels. Chaque publication conserve ses six ou sept matchs ordonnés, les probabilités et sources de l’analyse, ainsi qu’une ou plusieurs combinaisons de même longueur composées de `1`, `N` ou `2`.

Une combinaison représente une mise strictement virtuelle de 1 EUR. Mises, gains par ticket, retours, résultats nets et statistiques cumulées sont calculés automatiquement depuis les fichiers de contenu. Aucun argent réel n’est joué, les pronostics peuvent être faux et aucun gain n’est garanti.

## Routes publiques

- `/` : statistiques cumulées et liste des publications Loto Foot 7, avec un état vide lorsqu’aucune grille n’existe ;
- `/grille/[id]/` : détail d’une publication et de son éventuel règlement, ou réponse HTTP 404 pour un identifiant inconnu ;
- `/mentions-legales/` : mentions légales ;
- `/confidentialite/` : politique de confidentialité ;
- toute autre URL renvoie une page 404 cohérente.

## Socle technique

- Qwik et Qwik City avec TypeScript strict ;
- rendu serveur et adaptateur Vercel Edge ;
- ESLint et Prettier ;
- Vitest ;
- GSAP, chargé côté client uniquement pour l’introduction visuelle ;
- identité sombre Preuve90, logo, favicon et composants d’interface génériques.

Les publications et résultats officiels sont des fichiers JSON distincts et validés, chargés au build sans accès au système de fichiers au runtime. Les dossiers peuvent rester vides et aucune base de données, API ou route d’administration n’est nécessaire.

## Publications et automatisation

- publications immuables : [`src/content/loto-foot/publications/`](./src/content/loto-foot/publications/) ;
- résultats officiels séparés : [`src/content/loto-foot/results/`](./src/content/loto-foot/results/) ;
- types, validation et chargeur : [`src/content/loto-foot/`](./src/content/loto-foot/) ;
- instructions de la tâche planifiée ChatGPT : [`docs/automations/preuve90.md`](./docs/automations/preuve90.md).

Codex modifie le projet uniquement sur une branche dédiée et ne pousse jamais directement sur `master`. La tâche planifiée ChatGPT dispose d’une exception étroite : elle peut ajouter sur `master` un nouveau fichier JSON de publication ou de résultat conforme, sans modifier ni supprimer aucun contenu existant, code ou document.

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
npm run lint
npm run build.types
npm run test:run
npm run build
npm run check
```

`npm run check` vérifie successivement le formatage, le lint, les types, les tests et le build de production.

## Contribution

Les règles de travail du dépôt vivent dans [`AGENTS.md`](./AGENTS.md). Les décisions techniques actives sont consignées dans [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md) et la référence visuelle actuelle dans [`docs/DESIGN.md`](./docs/DESIGN.md).
