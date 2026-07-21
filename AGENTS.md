# Preuve90 — Instructions de projet

## Mission

Preuve90 est une expérience publique et transparente qui mesure la capacité d’une IA à rechercher une valeur estimée parmi des événements sportifs avant leur début.

Le produit n’est pas un service de paris, ne place aucun pari réel et ne doit jamais promettre de gain.

Avant toute modification significative, lire `docs/product/PROJECT.md` et `docs/architecture/DECISIONS.md`.

## Invariants produit

- Tous les sports et pays visibles sur les pages publiques consultées de Betclic France peuvent être analysés.
- Seul le marché simple principal `h2h`, avec deux ou trois issues Betclic exactes, est admis.
- Un événement candidat commence entre 30 minutes et 8 heures après l’observation, bornes incluses.
- Une exécution publie zéro ou un pronostic, sans plafond quotidien codé en dur et sans forcer une publication.
- Chaque pronostic doit être pertinent ; la formulation autorisée est « meilleur candidat parmi les prochains événements analysés », jamais « meilleur pari absolu ».
- Un identifiant interne et un événement ne peuvent apparaître qu’une seule fois.
- La mise virtuelle est fixe à 5 EUR ; aucun argent réel, compte joueur, pari combiné, en direct, handicap, total, score exact ou pari joueur n’est autorisé.
- Aucun lien commercial vers un bookmaker n’est proposé au lancement.
- Betclic (FR), clé `betclic_fr`, reste le bookmaker de référence clairement affiché.
- La cote, les issues, le bookmaker et leur horodatage sont enregistrés avant le début de l’événement.
- Une cote et un pronostic publiés sont immuables : ils ne sont jamais supprimés, antidatés ou réécrits après le résultat.
- Le règlement est ajouté comme un fait distinct et traçable.
- Les données manquantes ne sont jamais inventées.
- Les probabilités et espérances sont des estimations de l’IA, jamais une garantie de gain ou de rendement futur.

## Stack et conventions Qwik

- Framework : Qwik et Qwik City ; langage : TypeScript strict.
- Gestionnaire de paquets : npm avec `package-lock.json` versionné.
- Runtime : Node.js 22.12 ou version LTS compatible avec `engines`.
- Hébergement : Vercel avec l’adaptateur Qwik Vercel Edge existant.
- Interface et documentation produit en français ; identifiants, types et fonctions techniques en anglais clair.
- Utiliser `component$`, `$`, `routeLoader$`, `routeAction$` et les primitives Qwik adaptées.
- Éviter l’hydratation ou l’exécution cliente inutile et garder les accès externes côté serveur.
- Ne pas ajouter de dépendance de production sans besoin démontré et validation du propriétaire.
- Centraliser les calculs métier dans des fonctions pures déterministes et les couvrir par des tests.

## Modèle métier

- Mise virtuelle : 500 centimes.
- Gagné : retour = mise × cote enregistrée ; perdu : retour = 0 ; annulé : retour de la mise.
- Résultat net = retours − mises réglées.
- ROI = résultat net / mises réglées, avec gestion explicite de l’absence de mise.
- Taux de réussite = gagnés / (gagnés + perdus).
- Utiliser des montants décimaux maîtrisés afin d’éviter toute incohérence financière d’affichage.

## Faits JSON et traçabilité

- Publications et règlements sont des JSON distincts, immuables, append-only et versionnés dans Git.
- Ils sont chargés au build avec `import.meta.glob` ; aucun `fs` au runtime Vercel Edge.
- Les fixtures de démonstration sont réservées au développement et ne remplacent jamais un état vide de production.
- Un pronostic utilise la provenance publique `{ provider: "betclic-public", eventId, reference }`.
- Un règlement utilise `betclic-public` ou `official-source`, avec `eventId` et une référence publique.
- Respecter `bookmaker.observedAt <= publishedAt < startsAt`.
- Conserver les timestamps en UTC au format ISO 8601 et afficher les dates dans le fuseau approprié.
- Toute publication et tout règlement doivent être idempotents ; une exécution n’ajoute jamais de doublon et ne modifie jamais silencieusement un fait existant.

## Tâche planifiée ChatGPT

La tâche planifiée ChatGPT est créée et configurée manuellement hors du dépôt. Sa seule instruction opérationnelle versionnée est `docs/automations/preuve90.md`, qu’elle lit intégralement. Elle ne modifie jamais ses propres consignes.

## Sécurité

- Ne jamais lire, afficher, committer ou journaliser le contenu de `.env`, des secrets Vercel ou des secrets GitHub.
- Les exemples utilisent uniquement des noms de variables et des valeurs factices.
- Aucun secret dans le code client, les fichiers publics, les logs ou les messages de commit.
- Valider toute donnée externe à la frontière du système.
- Refuser toute fonctionnalité facilitant directement un pari réel sans nouvelle décision produit et juridique.

## Tests et méthode de travail

- Avant de coder, inspecter l’état du dépôt et les fichiers concernés, identifier les invariants touchés et signaler les hypothèses importantes.
- Préférer des changements petits, ciblés, vérifiables et réversibles.
- Exécuter les tests ciblés puis, autant que possible, `npm run check`.
- Si une commande ne peut pas être exécutée, l’indiquer dans le compte rendu ou la pull request.

## Git et revue

- Créer une branche locale ciblée avant toute modification et ne jamais pousser directement sur `master`.
- Ne pas réécrire l’historique partagé ni utiliser `git push --force` sans décision humaine exceptionnelle et explicite.
- Ajouter uniquement de nouveaux faits JSON ; ne jamais modifier, supprimer ou renommer un fait déjà publié.
- Utiliser des commits courts et cohérents, de préférence au format Conventional Commits.
- La pull request explique le pourquoi, les risques, les tests et les décisions restantes ; elle n’est jamais fusionnée automatiquement.
