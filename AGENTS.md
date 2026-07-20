# Preuve90 — Instructions de projet

## Mission

Preuve90 est une expérience publique et transparente qui mesure la capacité d'une IA à rechercher une valeur estimée parmi des événements sportifs avant leur début.

Le produit n'est pas un service de paris, ne place aucun pari réel et ne doit jamais promettre de gain.

Avant toute modification significative, lire :

1. `docs/product/PROJECT.md`
2. `docs/architecture/DECISIONS.md`
3. le fichier concerné dans `docs/automations/` pour tout travail d'automatisation

## Invariants produit

Ces règles ne peuvent pas être assouplies sans décision explicite du propriétaire du projet :

- tous sports et tous pays parmi les événements effectivement retournés par The Odds API ;
- marché simple principal `h2h` uniquement, avec deux ou trois issues Betclic exactes ;
- zéro ou un pronostic peut être publié par scan, sans plafond quotidien codé en dur ;
- un même blob de snapshot de cotes ne peut produire qu’un seul pronostic ;
- chaque pronostic doit rester pertinent et aucun ne doit être créé uniquement pour augmenter le volume ;
- un identifiant interne et un événement ne peuvent apparaître qu’une seule fois ;
- mise virtuelle fixe de 5 EUR ;
- aucun argent réel ;
- aucun compte joueur ;
- aucun pari combiné, en direct, handicap, total, score exact ou pari joueur ;
- aucun lien commercial vers un bookmaker au lancement ;
- aucune promesse de gain ou formulation laissant entendre un rendement futur garanti ;
- bookmaker français de référence fixe Betclic (FR), clé `betclic_fr`, clairement affiché ;
- cote, issues, bookmaker et horodatage enregistrés avant le début de l’événement ;
- une cote publiée est immuable ;
- un pronostic publié n'est jamais supprimé, antidaté ou réécrit après le résultat ;
- le règlement d'un pronostic est ajouté comme un fait distinct et traçable ;
- les données manquantes ne doivent jamais être inventées.
- les probabilités et espérances sont toujours présentées comme des estimations de l’IA, jamais comme une garantie ;
- la formulation autorisée est « meilleur candidat parmi les prochains événements analysés », jamais « meilleur pari absolu ».

## Stack et conventions

- Framework : Qwik et Qwik City.
- Langage : TypeScript strict.
- Gestionnaire de paquets : npm avec `package-lock.json` versionné.
- Runtime de référence : Node.js 22.12 ou version LTS compatible avec le champ `engines`.
- Hébergement : Vercel avec l'adaptateur Qwik Vercel Edge existant.
- Langue de l'interface et de la documentation produit : français.
- Noms techniques, identifiants, types et fonctions : anglais clair.

Respecter les mécanismes Qwik :

- utiliser `component$`, `$`, `routeLoader$`, `routeAction$` et les primitives Qwik adaptées ;
- éviter les habitudes React qui provoquent une hydratation ou une exécution cliente inutile ;
- garder les accès aux secrets et aux API externes exclusivement côté serveur ;
- ne pas introduire de dépendance de production sans besoin démontré et sans validation du propriétaire ;
- préférer des fonctions pures pour les calculs métier et les couvrir par des tests dès que le moteur de domaine est créé.

## Modèle métier

Les calculs doivent rester centralisés et déterministes.

- Mise virtuelle : `5`.
- Pronostic gagné : `return = stake * recordedOdds`.
- Pronostic perdu : `return = 0`.
- Pronostic annulé : retour de la mise, sauf règle métier documentée autrement.
- Résultat net : `totalReturn - totalStaked`.
- Rendement sur les mises : `netResult / totalStaked`, avec gestion explicite du cas où aucune mise n'existe.
- Taux de réussite : victoires divisées par les pronostics réglés hors annulations, sauf décision documentée autrement.

Utiliser des montants décimaux maîtrisés. Ne jamais laisser des approximations flottantes produire des valeurs financières incohérentes dans l'interface.

## Données et traçabilité

- La V1 charge des publications et règlements JSON distincts, immuables et versionnés dans Git.
- Le chargement utilise `import.meta.glob` au build ; ne jamais utiliser `fs` au runtime Vercel Edge.
- Les données de démonstration sont autorisées uniquement en développement et ne remplacent jamais un état vide de production.

- The Odds API est limitée au forfait gratuit de 500 crédits mensuels.
- Toute intégration doit mesurer ou journaliser la consommation estimée.
- Éviter les appels par match lorsqu'un appel groupé suffit.
- Mettre en cache les réponses lorsque cela ne compromet pas l'actualité de la cote.
- Ne jamais remplacer une cote enregistrée par une cote plus récente.
- Chaque pronostic recopie le `generatedAt` et le blob SHA GitHub exact de `snapshots/odds.json` utilisé.
- Conserver les timestamps en UTC au format ISO 8601 et afficher les dates dans le fuseau approprié côté interface.
- Les opérations de publication et de règlement doivent être idempotentes.
- Une nouvelle exécution ne doit jamais créer un doublon ni modifier silencieusement un fait publié.

## Automatisations ChatGPT

Les tâches ChatGPT sont créées manuellement hors du dépôt. Le plugin GitHub et ses permissions sont configurés manuellement ; leur disponibilité ne doit jamais être supposée. Aucun secret The Odds API n’est transmis à ChatGPT.

Une tâche planifiée doit :

1. lire `AGENTS.md` ;
2. lire intégralement son fichier d'instructions dans `docs/automations/` ;
3. vérifier les préconditions avant toute écriture ;
4. s'arrêter proprement si une source, une cote, un résultat ou un identifiant est ambigu ;
5. ne jamais publier de donnée estimée ou fabriquée ;
6. produire une trace concise de son exécution ;
7. respecter l'idempotence et les plafonds d'API.

Une tâche planifiée ne modifie jamais ses propres consignes. Les changements d'instructions passent par une pull request humaine.

## Sécurité

- Ne jamais lire, afficher, committer ou journaliser le contenu de `.env`, des secrets Vercel ou des clés API.
- Les exemples utilisent uniquement des noms de variables et des valeurs factices.
- Aucun secret dans le code client, les fichiers publics, les logs ou les messages de commit.
- Valider les données externes à la frontière du système avant de les utiliser.
- Refuser toute fonctionnalité facilitant directement un pari réel tant qu'elle ne fait pas l'objet d'une nouvelle décision produit et juridique.

## Méthode de travail

Avant de coder :

- inspecter l'état du dépôt et les fichiers concernés ;
- identifier les invariants touchés ;
- signaler les hypothèses importantes ;
- préférer une modification petite, vérifiable et réversible.

Après modification, exécuter autant que possible :

```bash
npm run check
```

Si une commande ne peut pas être exécutée, l'indiquer explicitement dans le compte rendu ou la pull request.

## Git et revue

- Ne jamais pousser directement sur `master` pour une modification de code ou de configuration.
- Utiliser une branche ciblée et une pull request.
- Ne pas réécrire l'historique partagé.
- Ne pas utiliser `git push --force`, sauf décision humaine exceptionnelle et explicite.
- Commits courts, cohérents et descriptifs, de préférence au format Conventional Commits.
- La pull request doit expliquer le pourquoi, les risques, les tests et les éventuelles décisions restant à prendre.

## Documentation

Mettre à jour la documentation dans le même changement lorsque le comportement, l'architecture, les variables d'environnement ou les automatisations évoluent.

Toute décision structurante doit être ajoutée à `docs/architecture/DECISIONS.md` avant ou avec son implémentation.
