# Contribuer à Preuve90

## Installation

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

Renseigner uniquement des secrets de développement dans `.env`. Ce fichier ne doit jamais être committé.

## Commandes

```bash
npm run dev        # serveur local Qwik
npm run fmt        # formater le dépôt
npm run fmt.check  # vérifier le formatage
npm run lint       # analyser le TypeScript Qwik
npm run build.types
npm run build
npm run check      # contrôle complet utilisé par la CI
```

## Workflow Git

1. Partir de `master` à jour.
2. Créer une branche ciblée, par exemple `feat/domain-model` ou `fix/odds-validation`.
3. Réaliser une modification cohérente et documentée.
4. Exécuter `npm run check`.
5. Ouvrir une pull request en remplissant le modèle.
6. Utiliser de préférence le squash merge après validation.

Les commits suivent de préférence Conventional Commits :

- `feat:` fonctionnalité ;
- `fix:` correction ;
- `docs:` documentation ;
- `test:` tests ;
- `refactor:` restructuration sans changement fonctionnel ;
- `ci:` intégration continue ;
- `chore:` maintenance.

## Décisions structurantes

Avant d'introduire une base de données, un fournisseur externe, une dépendance majeure, une nouvelle catégorie de pari ou une modification des règles de calcul, ajouter une proposition dans `docs/architecture/DECISIONS.md`.

## Travail avec Codex

Codex doit charger `AGENTS.md` automatiquement depuis la racine du dépôt.

Lors de la première ouverture locale du projet :

1. marquer le dépôt comme fiable dans Codex pour autoriser `.codex/config.toml` et `.codex/rules/` ;
2. ouvrir une nouvelle session depuis la racine ;
3. demander à Codex de résumer les instructions actives ;
4. vérifier qu'il mentionne les invariants de transparence, la commande `npm run check` et les règles d'automatisation.

Le dépôt ne fixe volontairement pas le nom du modèle. Sélectionner le meilleur modèle Codex disponible et conserver un effort de raisonnement élevé pour les tâches d'architecture, de sécurité ou de logique métier.

## Définition de terminé

Une modification est terminée lorsque :

- le comportement est correct et explicite ;
- les cas limites sont traités ;
- les invariants métier restent vrais ;
- les validations automatisées passent ;
- la documentation et les variables d'environnement sont à jour ;
- aucun secret n'apparaît dans le diff ;
- la pull request expose les risques et décisions restantes.
