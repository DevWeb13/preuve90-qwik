# Tâche planifiée — Publier un pronostic

## Statut

**Inactive tant que toutes les préconditions ne sont pas satisfaites.**

## Objectif

Rechercher les matchs éligibles et proposer zéro, un ou plusieurs pronostics football 1N2 pertinents pour la journée civile `Europe/Paris`. Aucun plafond quotidien n’est codé. `no_action` est un résultat normal ; aucune publication ne doit être forcée pour augmenter le volume.

## Préconditions obligatoires

- compétitions et fenêtre temporelle autorisées par une ADR ;
- snapshots nettoyés de la branche `automation-data` disponibles, valides et budget mensuel mesuré ;
- droits Git minimaux et procédure branche/revue humaine définis ;
- validations du dépôt vertes ;
- environnement de tâche capable de lire les snapshots sans recevoir le secret The Odds API ;
- aucun identifiant interne ni match candidat déjà publié.

Si une précondition manque, terminer avec `blocked` et ne créer aucun fichier.

## Instructions

1. Lire `AGENTS.md`, `docs/automations/README.md` et ce fichier depuis `master`, puis relever leur SHA.
2. Vérifier l’état Git, partir de `master` à jour et créer une branche unique dédiée.
3. Lire les fichiers de `src/content/predictions/` et relever les identifiants internes et matchs déjà publiés, y compris pour la journée `Europe/Paris`.
4. Lire les snapshots `odds.json` et `metadata.json` depuis `automation-data`, relever leur SHA et vérifier leur fraîcheur, leur mode et le budget ; ne jamais demander ou manipuler la clé The Odds API.
5. Refuser un snapshot invalide, incomplet, ambigu ou dont la marge de budget n’est plus assurée.
6. Conserver uniquement le football, le marché 1N2 réglementaire, les compétitions autorisées, les matchs non commencés et les trois cotes réellement disponibles chez Betclic (FR), clé `betclic_fr`.
7. Conserver uniquement les candidats réellement pertinents, sans quota minimal ni maximal. Distinguer les faits observés de l’interprétation et expliciter l’incertitude pour chacun.
8. Construire un JSON distinct conforme au type `Prediction` pour chaque candidat : identifiant stable, date de référence, timestamps UTC, compétition, match, sélection `HOME|DRAW|AWAY`, cote décimale en chaîne, Betclic (FR), mise `500`, justification et source The Odds API.
9. Vérifier que l’observation précède la publication, que la publication précède le coup d’envoi et que l’identifiant source correspond au match.
10. Ajouter les fichiers dans `src/content/predictions/` sans modifier, supprimer ou renommer aucun fait existant.
11. Exécuter `npm run test:run` et `npm run check`. En cas d’échec, ne pas pousser une branche rouge.
12. Examiner le diff, committer le seul fait attendu, pousser la branche et soumettre à la revue humaine selon la procédure approuvée.
13. Relire le fichier proposé et terminer avec le rapport défini dans `docs/automations/README.md`.

## Interdictions

- publication après le coup d’envoi ou antidatée ;
- cote moyenne, estimée, remplacée ou relevée chez un autre bookmaker ;
- doublon d’identifiant interne ou de match ;
- modification d’une publication existante ;
- donnée inventée, lien d’affiliation ou incitation à parier ;
- écriture directe sur `master`, fusion automatique ou déploiement manuel ;
- ajout d’un endpoint d’administration pour contourner le workflow Git.

## Résultats

- `success` : un ou plusieurs fichiers distincts ont été proposés sur une branche et les validations sont vertes ;
- `no_action` : aucun candidat suffisamment fiable ;
- `blocked` : précondition, budget, source ou accès Git indisponible ;
- `failed` : erreur technique sans fait partiel publié.
