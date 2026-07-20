# Tâche planifiée — Publier un pronostic

## Statut

**Inactive tant que toutes les préconditions ne sont pas satisfaites.**

## Objectif

Rechercher les matchs éligibles et proposer au maximum un pronostic football 1N2 pour la journée civile `Europe/Paris`. `no_action` est un résultat normal ; aucune publication ne doit être forcée.

## Préconditions obligatoires

- compétitions et fenêtre temporelle autorisées par une ADR ;
- intégration The Odds API serveur disponible et budget mensuel mesuré ;
- droits Git minimaux et procédure branche/revue humaine définis ;
- validations du dépôt vertes ;
- environnement de tâche capable d’utiliser les secrets sans les révéler ;
- aucune publication existante pour la date de référence.

Si une précondition manque, terminer avec `blocked` et ne créer aucun fichier.

## Instructions

1. Lire `AGENTS.md`, `docs/automations/README.md` et ce fichier depuis `master`, puis relever leur SHA.
2. Vérifier l’état Git, partir de `master` à jour et créer une branche unique dédiée.
3. Lire les fichiers de `src/content/predictions/` et vérifier qu’aucune publication n’existe pour la journée `Europe/Paris`.
4. Vérifier le budget avant tout appel ; refuser tout risque de dépasser 500 crédits mensuels et viser moins de 450.
5. Récupérer les matchs et cotes par appels groupés, sans répéter une requête valide.
6. Conserver uniquement le football, le marché 1N2 réglementaire, les compétitions autorisées, les matchs non commencés et une cote réellement disponible chez Betclic (FR), clé `betclic_fr`.
7. Choisir zéro ou un candidat. Distinguer les faits observés de l’interprétation et expliciter l’incertitude.
8. Construire un unique JSON conforme au type `Prediction` : identifiant stable, date de référence, timestamps UTC, compétition, match, sélection `HOME|DRAW|AWAY`, cote décimale en chaîne, Betclic (FR), mise `500`, justification et source The Odds API.
9. Vérifier que l’observation précède la publication, que la publication précède le coup d’envoi et que l’identifiant source correspond au match.
10. Ajouter le fichier dans `src/content/predictions/` sans modifier ni supprimer aucun fait existant.
11. Exécuter `npm run test:run` et `npm run check`. En cas d’échec, ne pas pousser une branche rouge.
12. Examiner le diff, committer le seul fait attendu, pousser la branche et soumettre à la revue humaine selon la procédure approuvée.
13. Relire le fichier proposé et terminer avec le rapport défini dans `docs/automations/README.md`.

## Interdictions

- publication après le coup d’envoi ou antidatée ;
- cote moyenne, estimée, remplacée ou relevée chez un autre bookmaker ;
- plus d’un pronostic par date ou doublon de match ;
- modification d’une publication existante ;
- donnée inventée, lien d’affiliation ou incitation à parier ;
- écriture directe sur `master`, fusion automatique ou déploiement manuel ;
- ajout d’un endpoint d’administration pour contourner le workflow Git.

## Résultats

- `success` : un fichier unique a été proposé sur une branche et les validations sont vertes ;
- `no_action` : aucun candidat suffisamment fiable ou une publication existe déjà ;
- `blocked` : précondition, budget, source ou accès Git indisponible ;
- `failed` : erreur technique sans fait partiel publié.
