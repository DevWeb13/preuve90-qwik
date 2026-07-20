# Tâche planifiée — Régler les pronostics

## Statut

**Inactive tant que toutes les préconditions ne sont pas satisfaites.**

## Objectif

Identifier les pronostics encore en attente dont la rencontre peut être réglée, récupérer les résultats officiels disponibles, ajouter un règlement immuable et recalculer les statistiques publiques.

## Préconditions obligatoires

Avant toute activation, vérifier que :

- le stockage distingue la publication originale du règlement ;
- les états `pending`, `won`, `lost` et `void` sont implémentés ;
- la source des scores et son interprétation du temps réglementaire sont documentées ;
- l'opération de règlement est idempotente et atomique ;
- les règles des matchs reportés, annulés, interrompus ou abandonnés sont documentées ;
- les agrégats sont calculés à partir des faits persistés, pas modifiés manuellement ;
- la consommation The Odds API est mesurée et contrôlée ;
- les calculs métier sont couverts par des tests.

Si une précondition manque, terminer avec `blocked` sans modifier de pronostic.

## Instructions d'exécution

1. Lire `AGENTS.md`, `docs/automations/README.md` et ce fichier depuis la branche par défaut.
2. Relever le SHA Git correspondant aux instructions.
3. Obtenir la liste des pronostics `pending` via l'interface serveur prévue.
4. Ne traiter que les rencontres dont l'heure de coup d'envoi est passée et dont une durée de sécurité documentée s'est écoulée.
5. Grouper les recherches de résultats afin de minimiser les appels The Odds API.
6. Vérifier le budget mensuel avant tout appel.
7. Pour chaque rencontre, vérifier que le résultat est final et que le score retenu correspond au temps réglementaire.
8. Ne pas utiliser le score après prolongation ou tirs au but pour un marché 1N2 en temps réglementaire.
9. Déterminer le résultat 1N2 :
   - `1` si l'équipe à domicile mène au terme du temps réglementaire ;
   - `N` si les scores sont égaux ;
   - `2` si l'équipe à l'extérieur mène.
10. Comparer ce résultat à la sélection publiée sans modifier cette dernière.
11. Préparer un règlement en mode validation ou `dry-run`.
12. Contrôler avant validation finale :
    - pronostic toujours `pending` ;
    - identifiant du match identique ;
    - résultat déclaré final par la source ;
    - score réglementaire disponible ;
    - aucun règlement existant ;
    - cote et mise identiques à la publication originale ;
    - retour calculé par le moteur métier.
13. Ajouter le règlement de manière atomique avec une clé d'idempotence stable.
14. Relire le règlement créé.
15. Recalculer les statistiques à partir de l'historique complet.
16. Vérifier les invariants comptables :
    - `totalStaked = predictionCount * 5` ;
    - le retour d'un gain utilise la cote enregistrée avant match ;
    - une perte retourne 0 ;
    - une annulation retourne 5 ;
    - `netResult = totalReturn - totalStaked` ;
    - aucun résultat n'est `NaN` ou infini.
17. Terminer avec un rapport structuré conforme à `docs/automations/README.md`.

## Cas qui ne doivent pas être réglés automatiquement

Laisser le pronostic en attente et signaler le motif lorsque :

- le résultat n'est pas déclaré final ;
- le match est reporté ;
- le match est interrompu ou abandonné ;
- l'identifiant externe ne correspond pas de manière certaine ;
- seul un score incluant prolongation ou tirs au but est disponible ;
- les sources se contredisent ;
- un règlement existe déjà avec des données différentes ;
- la règle d'annulation applicable n'est pas documentée.

Un statut `void` ne doit être appliqué automatiquement que si la règle exacte a été acceptée et implémentée.

## Enregistrement du règlement

Le règlement ajoute au minimum :

- identifiant du pronostic ;
- identifiant externe du match ;
- score au temps réglementaire ;
- résultat 1N2 constaté ;
- statut `won`, `lost` ou `void` ;
- retour virtuel calculé ;
- source du résultat ;
- heure de récupération ;
- heure du règlement ;
- version du schéma ;
- version Git des instructions ;
- identifiant de l'exécution.

## Interdictions

- Ne jamais modifier la sélection, la cote, le bookmaker, la mise ou la justification originale.
- Ne jamais supprimer une perte.
- Ne jamais utiliser une cote actuelle pour recalculer un gain.
- Ne jamais déduire un résultat final à partir d'un score en direct.
- Ne jamais classer automatiquement un cas ambigu comme annulé.
- Ne jamais corriger les statistiques manuellement pour les faire correspondre à une attente.

## Résultats possibles

- `success` : un ou plusieurs règlements ont été ajoutés et les agrégats vérifiés ;
- `no_action` : aucun pronostic n'est actuellement réglable ;
- `blocked` : résultat, règle, budget ou précondition indisponible ;
- `failed` : erreur technique sans règlement partiel incohérent.
