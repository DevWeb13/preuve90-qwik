# Preuve90

**Preuve90** est une expérience publique et transparente qui mesure la capacité d'une IA à produire des pronostics de football avant les matchs.

Chaque pronostic simule une mise fixe de **5 EUR**. Aucun argent réel n'est engagé, aucun compte joueur n'est proposé et l'application n'interagit pas avec un bookmaker.

## État du projet

Le projet est en phase d'initialisation. Le socle Qwik et Vercel Edge est présent, ainsi que les règles de développement et les contrats des futures automatisations.

Les tâches planifiées de publication et de règlement sont volontairement **inactives** jusqu'à la validation des décisions d'architecture nécessaires : persistance, bookmaker de référence, interface sécurisée et suivi du budget The Odds API.

## Périmètre initial

- football uniquement ;
- paris simples 1N2 uniquement ;
- temps réglementaire uniquement ;
- au maximum un pronostic par jour ;
- mise virtuelle fixe de 5 EUR ;
- aucun pari combiné ou hippique ;
- aucun argent réel ;
- aucun compte joueur ;
- aucun lien commercial vers un bookmaker au lancement ;
- aucune promesse de gain.

## Principes de transparence

- Chaque pronostic est publié et horodaté avant le coup d'envoi.
- La cote observée, le bookmaker et l'heure du relevé sont conservés définitivement.
- Une publication originale n'est jamais supprimée, antidatée ou réécrite après le résultat.
- Le règlement est ajouté séparément et reste traçable.
- L'historique complet inclut les gains, les pertes et les annulations.
- Les performances passées ne garantissent aucune performance future.

## Stack

- [Qwik](https://qwik.dev/) et Qwik City ;
- TypeScript strict ;
- Node.js 22.12 ;
- npm ;
- adaptateur Vercel Edge ;
- The Odds API pour les cotes et résultats, avec un plafond de 500 crédits mensuels.

## Installation locale

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

Le serveur de développement est généralement accessible sur `http://localhost:5173`.

Ne jamais committer le fichier `.env` ni afficher son contenu dans un prompt, un log ou une pull request.

## Commandes principales

```bash
npm run dev        # lancer Qwik en développement
npm run fmt        # formater le dépôt
npm run fmt.check  # vérifier le formatage
npm run lint       # exécuter ESLint
npm run build.types
npm run build
npm run check      # contrôle complet utilisé par la CI
```

## Documentation

- [`AGENTS.md`](./AGENTS.md) : instructions permanentes pour Codex et les agents de développement ;
- [`docs/product/PROJECT.md`](./docs/product/PROJECT.md) : contrat produit et invariants ;
- [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md) : registre des décisions d'architecture ;
- [`docs/automations/README.md`](./docs/automations/README.md) : fonctionnement commun des tâches planifiées ;
- [`docs/automations/publish-prediction.md`](./docs/automations/publish-prediction.md) : contrat de publication ;
- [`docs/automations/settle-predictions.md`](./docs/automations/settle-predictions.md) : contrat de règlement ;
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) : workflow local, Git et Codex.

## Codex

Le dépôt contient une configuration locale dans `.codex/` :

- effort de raisonnement élevé ;
- modèle non figé afin d'utiliser le meilleur modèle Codex disponible ;
- écriture limitée au workspace ;
- approbation demandée pour les opérations externes ou destructrices ;
- règles interdisant notamment la réécriture forcée de l'historique Git.

À la première ouverture dans Codex ou l'extension VS Code, marquer le dépôt comme fiable afin que la configuration locale soit chargée.

## Automatisations ChatGPT

À terme, deux tâches planifiées liront leurs consignes depuis la branche par défaut à chaque exécution :

1. recherche et publication éventuelle d'un nouveau pronostic ;
2. règlement des rencontres terminées et recalcul des statistiques.

Une exécution peut légitimement conclure qu'aucune action n'est nécessaire. Les tâches ne doivent jamais forcer une publication, inventer une donnée ou dépasser le budget API.

## Déploiement

Le starter utilise l'adaptateur Qwik Vercel Edge et produit sa sortie dans `.vercel/output`.

La variable `ORIGIN` doit correspondre à l'origine publique du site dans chaque environnement. Les clés API et secrets d'automatisation restent exclusivement côté serveur dans les variables d'environnement Vercel.

## Avertissement

Preuve90 ne place aucun pari réel et ne constitue pas un conseil financier. Les jeux d'argent comportent des risques de pertes et d'addiction et sont interdits aux mineurs. La cote affichée est une cote observée à un instant donné, pas la preuve qu'un bookmaker l'aurait acceptée pour un utilisateur particulier.
