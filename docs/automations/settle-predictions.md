# Tâche planifiée — Régler les pronostics

## Statut

**Inactive tant que toutes les préconditions ne sont pas satisfaites.**

## Objectif

Identifier les publications sans règlement dont le résultat réglementaire est certain, puis proposer des fichiers de règlement immuables. Les statistiques restent dérivées au build et ne sont jamais écrites dans un fichier d’agrégats.

## Préconditions obligatoires

- source de scores et interprétation du temps réglementaire documentées ;
- règles acceptées pour matchs reportés, annulés, interrompus ou abandonnés ;
- snapshot nettoyé de résultats et suivi du budget The Odds API disponibles ;
- droits Git minimaux et procédure branche/revue humaine définis ;
- validations et calculs métier du dépôt verts.

Si une précondition manque, terminer avec `blocked` sans créer de règlement.

## Instructions

1. Lire `AGENTS.md`, `docs/automations/README.md` et ce fichier depuis `master`, puis relever leur SHA.
2. Vérifier l’état Git, partir de `master` à jour et créer une branche unique dédiée.
3. Charger les publications et règlements JSON ; dériver `PENDING` uniquement pour les publications sans règlement.
4. Ne traiter que les rencontres passées après la marge de sécurité acceptée.
5. Lire `results.json` et `metadata.json` depuis `automation-data`, relever leur SHA, vérifier le budget et n’utiliser qu’un résultat déclaré final ; ne jamais demander ou manipuler la clé The Odds API.
6. Retenir le score au temps réglementaire, jamais celui après prolongation ou tirs au but.
7. Déterminer `HOME`, `DRAW` ou `AWAY`, le comparer à la sélection publiée et produire `WON`, `LOST` ou, uniquement avec une règle acceptée, `VOID`.
8. Construire un JSON `Settlement` contenant l’identifiant de publication, `settledAt` UTC, le statut, le score final et la source The Odds API avec le même identifiant d’événement.
9. Vérifier qu’aucun règlement n’existe, que la publication reste inchangée, que l’heure de règlement suit le coup d’envoi et que `WON` ou `LOST` correspond exactement au score réglementaire.
10. Ajouter un fichier par règlement dans `src/content/settlements/`, sans modifier, supprimer ou renommer les publications ou règlements existants.
11. Exécuter `npm run test:run` et `npm run check`, puis vérifier les retours dérivés : gagné = mise × cote enregistrée, perdu = 0, annulé = 500 centimes.
12. Examiner le diff, committer les seuls faits attendus, pousser la branche et soumettre à la revue humaine selon la procédure approuvée.
13. Terminer avec le rapport défini dans `docs/automations/README.md`.

## Cas laissés en attente

- résultat non final, report, interruption ou abandon ;
- identifiant externe ambigu ;
- score réglementaire indisponible ;
- sources contradictoires ;
- règlement existant différent ;
- règle d’annulation non acceptée.

## Interdictions

- modification de la sélection, cote, bookmaker, mise ou justification d’origine ;
- suppression d’une perte ou recalcul avec une cote actuelle ;
- déduction depuis un score en direct ;
- stockage manuel de statistiques ou retour virtuel dans le règlement ;
- écriture directe sur `master`, fusion automatique ou déploiement manuel ;
- ajout d’un endpoint d’administration pour contourner le workflow Git.

## Résultats

- `success` : un ou plusieurs règlements ont été proposés sur une branche avec validations vertes ;
- `no_action` : aucun pronostic n’est réglable ;
- `blocked` : résultat, règle, budget ou accès indisponible ;
- `failed` : erreur technique sans règlement partiel publié.
