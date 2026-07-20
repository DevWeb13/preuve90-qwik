# Preuve90 — Contrat produit

## Résumé

Preuve90 publie une expérience publique sur la capacité d'une IA à effectuer des prévisions sportives.

L'application publie avant leur commencement des pronostics sur des matchs de football. Chaque pronostic simule une mise fixe de 5 EUR. Aucun argent réel n'est engagé et aucune interaction avec un bookmaker n'a lieu.

## Positionnement

Le produit doit être présenté comme une expérience mesurable et auditable, jamais comme une méthode pour gagner de l'argent.

Le ton éditorial doit être factuel, prudent et transparent. Les performances historiques sont affichées sans extrapolation commerciale et sans garantie de performance future.

## Périmètre initial

- Football uniquement.
- Paris simples 1N2 uniquement.
- Résultat au terme du temps réglementaire uniquement.
- Au maximum un pronostic pertinent par jour.
- Aucun pari hippique.
- Aucun pari combiné.
- Aucun argent réel.
- Aucun compte joueur.
- Aucun lien commercial ou d'affiliation vers un bookmaker au lancement.
- Aucune promesse de gain.

## Sources de données

Les cotes et les résultats sont récupérés avec The Odds API en utilisant uniquement son forfait gratuit de 500 crédits mensuels.

Betclic (FR), clé technique `betclic_fr`, sert de référence fixe. Pour chaque pronostic, l'application affiche clairement :

- le bookmaker de référence réellement interrogé ;
- la cote observée ;
- la date et l'heure du relevé ;
- le fait que cette cote observée ne prouve pas qu'elle aurait été acceptée pour un utilisateur donné.

Cette référence est consignée dans l’ADR-007 et ne peut pas changer opportunément selon les matchs.

## Architecture des faits V1

La V1 ne possède aucune base de données ni route API d’administration. Les publications et règlements sont des fichiers JSON distincts, immuables et versionnés dans Git. Vite les intègre au build avec `import.meta.glob` ; aucun accès au système de fichiers n’a lieu au runtime Vercel Edge.

Les futurs robots ChatGPT travailleront sur une branche dédiée, ajouteront au plus un nouveau fichier par fait et soumettront leur proposition à une revue humaine. Ils ne modifieront jamais une publication existante.

En développement uniquement, des fixtures TypeScript déterministes rendent l’interface vérifiable lorsque la collection réelle est vide. Elles sont identifiées par un bandeau et ne remplacent jamais l’état vide de production.

## Enregistrement immuable d'un pronostic

Chaque pronostic publié conserve définitivement :

- un identifiant stable ;
- le sport et la compétition ;
- les deux équipes ;
- l'identifiant externe du match ;
- l'heure prévue du coup d'envoi ;
- la sélection 1, N ou 2 ;
- la cote observée ;
- le bookmaker ;
- la date et l'heure du relevé ;
- la date et l'heure de publication ;
- la mise virtuelle de 5 EUR ;
- la justification du pronostic ;
- sa justification et son incertitude.

La partie publiée avant le match est immuable. Le résultat et le règlement sont ajoutés comme des événements ou enregistrements distincts afin de préserver la preuve originale.

## États

Les états métier visibles sont :

- `pending` : le match n'est pas encore réglé ;
- `won` : la sélection est correcte ;
- `lost` : la sélection est incorrecte ;
- `void` : le pronostic est annulé selon une règle documentée.

Un état inconnu ou ambigu ne doit jamais être transformé automatiquement en victoire, défaite ou annulation.

## Calculs

La mise virtuelle est toujours de 5 EUR.

Pour un pronostic gagné :

```text
simulatedReturn = 5 * recordedOdds
```

Pour un pronostic perdu :

```text
simulatedReturn = 0
```

Pour un pronostic annulé, la mise est rendue :

```text
simulatedReturn = 5
```

Les agrégats affichés comprennent au minimum :

- total virtuellement misé ;
- retour total ;
- résultat net ;
- taux de réussite ;
- rendement sur les mises ;
- nombre de jours depuis le lancement ;
- historique complet des gains, pertes et annulations.

Définitions initiales :

```text
netResult = totalReturn - totalStaked
roi = netResult / totalStaked
successRate = won / (won + lost)
```

Le cas sans pronostic réglé doit produire une valeur neutre et compréhensible, jamais `NaN` ou `Infinity`.

## Transparence et preuve

- Un pronostic doit être publié avant le début du match.
- Une publication tardive est rejetée, pas antidatée.
- Les données publiées avant match ne sont jamais supprimées ou réécrites après le résultat.
- La cote enregistrée n'est jamais remplacée par une cote ultérieure.
- Les corrections exceptionnelles sont ajoutées sous forme d'événements explicites, motivés et horodatés ; elles ne masquent pas l'information originale.
- L'historique complet reste accessible, y compris les pertes.

## Avertissements obligatoires

Le site doit indiquer clairement :

- qu'aucun pari réel n'a été placé ;
- que la mise de 5 EUR est entièrement virtuelle ;
- que les cotes sont observées à un instant donné ;
- que les performances passées ne garantissent pas les performances futures ;
- que les jeux d'argent comportent des risques financiers et d'addiction ;
- que les jeux d'argent sont interdits aux mineurs.

Les formulations juridiques définitives devront être validées avant ouverture publique.

## Automatisation

Deux tâches ChatGPT distinctes sont prévues, mais restent inactives tant que leurs préconditions opérationnelles ne sont pas toutes décidées :

1. recherche, analyse et publication d'un nouveau pronostic ;
2. vérification des matchs terminés, règlement des pronostics et recalcul des statistiques.

Leurs contrats d'exécution sont définis dans `docs/automations/`.

## Critères de lancement minimal

Le lancement public ne peut pas avoir lieu avant que les éléments suivants existent :

- stockage immuable des publications et règlements dans Git ;
- validation stricte des données externes ;
- Betclic (FR) comme bookmaker de référence ;
- suivi de la consommation The Odds API ;
- tâches idempotentes de publication et de règlement ;
- affichage de l'historique complet ;
- tests du moteur de calcul ;
- avertissements et mentions légales visibles ;
- journalisation technique sans secret ;
- déploiement de production vérifié.
