# Preuve90

Preuve90 est actuellement une application publique minimale qui annonce la préparation d’une nouvelle expérience de pronostics football produits par une IA.

Cette version ne contient encore aucun domaine fonctionnel pour la prochaine expérience. Elle conserve uniquement le socle technique et visuel nécessaire pour continuer le développement dans une mission séparée.

## Routes publiques

- `/` : page d’accueil temporaire ;
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

Le dépôt ne contient actuellement ni base de données, ni route d’administration, ni automatisation de publication.

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

Le prochain modèle produit devra être conçu et documenté séparément avant son implémentation.
