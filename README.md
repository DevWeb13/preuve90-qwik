# Preuve90

Preuve90 est une expérience publique et transparente qui mesure la capacité d’une IA à produire des pronostics de football avant les matchs, résultats compris.

Chaque publication porte sur le marché simple 1N2 au temps réglementaire et simule une mise fixe de **5 EUR**. Aucun argent réel n’est engagé, aucun compte joueur n’existe et l’application n’interagit pas avec un bookmaker.

## V1

La V1 fournit une interface Qwik responsive « Cyber Football Lab », un historique immuable, des preuves permanentes, des statistiques dérivées et une méthode publique. Betclic (FR), clé `betclic_fr`, est l’unique bookmaker de référence.

Routes publiques :

- `/` : tableau de bord et dernier pronostic ;
- `/historique/` : journal complet filtrable par statut ;
- `/pronostic/[id]/` : preuve permanente ;
- `/statistiques/` : agrégats et courbe cumulative SVG ;
- `/methode/` : protocole détaillé ;
- `/mentions-legales/` et `/confidentialite/` : informations légales ;
- toute route inconnue : état 404 cohérent.

## Stack

- Qwik 1 et Qwik City, TypeScript strict ;
- Vite 7 et adaptateur Vercel Edge ;
- GSAP chargé dynamiquement pour quatre animations signatures ;
- Vitest pour les fonctions métier pures ;
- CSS natif, SVG inline, aucune bibliothèque UI ou de graphique ;
- Node.js 22.12 ou version compatible avec `engines`, npm 10.

## Architecture des données

Il n’existe ni base de données, ni ORM, ni route API d’administration en V1.

```text
src/content/
├── predictions/       # futures publications réelles *.json
├── settlements/       # futurs règlements réels *.json
└── demo/              # fixtures TypeScript, développement uniquement
```

Les JSON sont intégrés au build avec `import.meta.glob` en mode eager. La couche serveur valide les schémas, l’unicité des identifiants, la limite d’une publication par date `Europe/Paris`, Betclic (FR), la mise de 500 centimes et l’association des règlements. Elle n’utilise jamais `fs` au runtime Edge.

Une publication ne contient pas son statut. L’absence de règlement dérive `PENDING`; un règlement distinct porte `WON`, `LOST` ou `VOID`. Les retours et statistiques sont toujours recalculés au centime depuis ces faits.

## Mode démonstration

En développement, si aucun fichier réel n’existe, sept scénarios déterministes et explicitement fictifs rendent toutes les vues testables. Un bandeau affiche :

```text
MODE DÉMONSTRATION — Ces données ne sont pas des pronostics publiés.
```

Une vraie publication désactive les fixtures. Un build de production n’utilise jamais ces données et présente un état vide propre si les collections JSON sont vides. Les pages de détail de démo portent `noindex`.

## Installation locale

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

Le serveur est généralement disponible sur `http://localhost:5173`. Ne jamais committer `.env`, afficher une clé API ou préfixer un secret avec `PUBLIC_`.

## Commandes

```bash
npm run dev          # serveur de développement
npm run test         # Vitest en surveillance
npm run test:run     # tests unitaires non interactifs
npm run fmt          # formatage Prettier
npm run fmt.check    # contrôle du formatage
npm run lint         # ESLint Qwik/TypeScript
npm run build.types  # TypeScript strict
npm run build        # build Qwik + Vercel Edge
npm run check        # format + lint + types + tests + build
```

## Contribution et faits immuables

1. partir de `master` à jour et créer une branche ciblée ;
2. ne jamais modifier directement `master` ni réécrire l’historique partagé ;
3. ajouter une publication dans `src/content/predictions/` sans modifier les faits existants ;
4. ajouter son règlement séparément dans `src/content/settlements/` ;
5. exécuter `npm run check` ;
6. soumettre la branche à une revue humaine.

Les futurs robots ChatGPT suivront ce même modèle Git append-only. Ils restent inactifs tant que leurs préconditions (compétitions, budget API, règles des matchs ambigus et droits Git) ne sont pas décidées.

## Configuration

- `ORIGIN` : origine utilisée par Qwik City ;
- `PUBLIC_ORIGIN` : origine publique optionnelle pour les canonical absolues ;
- `THE_ODDS_API_KEY` : future clé serveur, jamais utilisée dans le client ;
- `REFERENCE_BOOKMAKER_KEY` : valeur fixe `betclic_fr`.

Les champs `publisherName`, `publisherAddress` et `contactEmail` dans `src/config/site.ts` doivent être complétés avant lancement public.

## Documentation

- [`docs/product/PROJECT.md`](./docs/product/PROJECT.md) : contrat produit ;
- [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md) : décisions acceptées et ouvertes ;
- [`docs/DESIGN.md`](./docs/DESIGN.md) : référence « Cyber Football Lab » ;
- [`docs/automations/`](./docs/automations/) : contrats des futurs robots ;
- [`AGENTS.md`](./AGENTS.md) : invariants permanents.

## Validation continue

La CI installe avec `npm ci`, vérifie le formatage, ESLint, TypeScript, les tests unitaires et le build. Elle dispose uniquement du droit de lecture et ne modifie ni ne pousse de code.

## Avertissement

Preuve90 ne place aucun pari réel et ne constitue pas un conseil financier. Les jeux d’argent comportent des risques de pertes et d’addiction et sont interdits aux mineurs. Une cote affichée est une observation horodatée, pas la preuve qu’un bookmaker l’aurait acceptée pour une personne particulière. Les performances passées ne garantissent aucun résultat futur.
