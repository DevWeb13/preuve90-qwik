# Preuve90

Preuve90 est une expérience publique et transparente qui mesure la capacité d’une IA à rechercher un pronostic simple multisport présentant une valeur estimée positive avant le début de l’événement, résultats compris.

Chaque exécution consulte les pages publiques actuelles de Betclic France pour le marché principal `h2h`. Elle peut publier zéro ou un pronostic, le « meilleur candidat parmi les prochains événements analysés ». Chaque publication simule une mise fixe de **5 EUR**. Aucun argent réel n’est engagé, aucun compte joueur n’existe et l’application n’interagit pas avec un bookmaker.

## Contrat produit

- tous sports et tous pays visibles sur les pages publiques Betclic France consultées ;
- Betclic (FR), clé `betclic_fr`, comme unique bookmaker de référence ;
- marché `h2h` simple, avec exactement deux ou trois issues conservées sous leur nom exact ;
- début compris entre 30 minutes et 8 heures après l’observation, bornes incluses ;
- zéro ou un pronostic par scan, sans plafond journalier ;
- une provenance publique traçable pour chaque pronostic ;
- cote, observation, probabilité estimée et publication immuables ;
- aucun pari réel, live, combiné, handicap, total, score exact ou pari joueur ;
- aucune garantie de gain ou de rentabilité et aucun lien bookmaker.

Le direct est exclu. Preuve90 choisit uniquement parmi les pages publiques effectivement consultées et ne prétend jamais analyser tout Betclic.

## Interface

L’interface Qwik responsive « AI Value Lab » expose :

- `/` : tableau de bord et publications du jour ;
- `/historique/` : journal complet filtrable par statut ;
- `/pronostic/[id]/` : preuve permanente ;
- `/statistiques/` : agrégats, estimations moyennes et courbe cumulative ;
- `/methode/` : protocole détaillé ;
- `/mentions-legales/` et `/confidentialite/` : informations légales.

Les cartes distinguent toujours la performance réellement réglée de la probabilité et de l’espérance estimées par l’IA. Une valeur estimée positive signifie que la probabilité évaluée par l’IA dépasse le seuil nécessaire pour rentabiliser la cote ; cette estimation peut être erronée.

## Architecture des faits

Il n’existe ni base de données, ni ORM, ni route API d’administration.

```text
src/content/
├── predictions/       # futures publications réelles *.json
├── settlements/       # futurs règlements réels *.json
└── demo/              # fixtures TypeScript, développement uniquement
```

Les JSON sont intégrés au build avec `import.meta.glob` en mode eager, sans `fs` au runtime Edge. Chaque publication conserve une provenance publique Betclic avec `provider`, `eventId` et `reference`. Une publication ne contient pas son statut : l’absence de règlement dérive `PENDING`; un règlement distinct porte `WON`, `LOST` ou `VOID`. Les retours et statistiques sont recalculés au centime depuis ces faits.

La tâche planifiée ChatGPT est configurée manuellement hors du dépôt et suit uniquement `docs/automations/preuve90.md`. Elle vérifie d’abord les règlements certains, consulte ensuite Betclic France, puis peut proposer de nouveaux fichiers JSON sur une branche et une pull request vers `master` selon ses permissions GitHub. La fusion reste toujours humaine.

## Mode démonstration

En développement, si aucun fichier réel n’existe, des scénarios déterministes et explicitement fictifs couvrent football à trois issues, tennis et basket à deux issues, ainsi que les états gagné, perdu, annulé et en attente. Un bandeau affiche :

```text
MODE DÉMONSTRATION — Ces données ne sont pas des pronostics publiés.
```

Une vraie publication désactive les fixtures. Un build de production conserve un état vide propre. Les pages de détail de démo portent `noindex`.

## Installation et commandes

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

```bash
npm run test:run
npm run fmt
npm run lint
npm run build.types
npm run build
npm run check:content-integrity
npm run check
```

`REFERENCE_BOOKMAKER_KEY` reste fixé à `betclic_fr`.

## Immutabilité et contribution

Partir de `master` à jour, créer une branche ciblée, ajouter un fichier distinct par nouveau fait, puis exécuter `npm run check`. Le contrôle append-only refuse toute modification, suppression ou renommage d’un JSON déjà présent sur la branche de base. Ne jamais pousser directement sur `master` ni réécrire l’historique partagé.

Les contrats complets vivent dans [`docs/product/PROJECT.md`](./docs/product/PROJECT.md), [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md), [`docs/DESIGN.md`](./docs/DESIGN.md) et [`docs/automations/preuve90.md`](./docs/automations/preuve90.md).

## Avertissement

Preuve90 ne place aucun pari réel et ne constitue pas un conseil financier. Les jeux d’argent comportent des risques de pertes et d’addiction et sont interdits aux mineurs. Une cote et une valeur estimée ne garantissent ni disponibilité, ni acceptation, ni gain futur.
