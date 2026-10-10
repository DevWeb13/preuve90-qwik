# Stratégie Loto Foot v2

Ce document complète `docs/automations/preuve90.md` uniquement pour la méthode d'analyse, la calibration des probabilités et la décision de mise. Toutes les règles de sécurité, de validation, d'écriture, de branche, de planification et de rapport de `preuve90.md` restent prioritaires.

## Objectif financier prioritaire

L'objectif expérimental unique est d'améliorer le résultat net : retours officiels moins mises virtuelles.

Le nombre de bonnes réponses, la couverture des issues et la diversité des combinaisons sont uniquement des indicateurs intermédiaires. Ils ne justifient jamais à eux seuls une mise supplémentaire.

Une grille peut donc conduire à `0` combinaison et `0 €` de mise lorsque l'analyse ne fait apparaître aucune opportunité suffisamment convaincante. Il n'existe ni nombre minimal de tickets à jouer, ni cible implicite de 10 ou 12 tickets.

## Mémoire statistique

Avant d'analyser une nouvelle grille, lire `docs/automations/loto-foot-strategy-stats.json` lorsqu'il existe.

Ce fichier est une mémoire statistique déterministe construite à partir des publications et résultats déjà réglés. Il sert à corriger les biais de décision sans remplacer l'analyse sportive de la grille courante.

S'il est absent, invalide ou momentanément en retard sur le dernier règlement, ne jamais bloquer une publication pour cette seule raison. Effectuer l'analyse normalement et signaler simplement que la mémoire statistique n'a pas pu être utilisée.

Utiliser en priorité :

- `recent20.summary.netCents`, `recent20.summary.yieldPct` et `recent20.strategySignals` pour détecter une dérive financière récente ;
- `recent20.ticketEconomics` pour comparer directement ce qu'ont coûté et rapporté le ticket principal et les tickets ajoutés ;
- `allTime.summary`, `allTime.byFormula` et `allTime.byTicketCount` pour conserver le contexte long terme ;
- `calibration` pour corriger une éventuelle surconfiance ou sous-confiance des probabilités annoncées ;
- `payoutHistory` uniquement comme repère historique des rangs payés et des rapports observés ;
- `selectionDistribution`, la couverture et la diversité seulement comme diagnostics secondaires, jamais comme objectifs financiers.

Ne jamais ajouter un ticket uniquement parce qu'il améliore `portfolioOutcomeCoveragePct`, `additionalTicketsImprovedBestScoreRatePct` ou la diversité.

## Analyse des rencontres

Continuer à effectuer la recherche complète demandée par `preuve90.md` pour chaque rencontre.

Produire les probabilités `1/N/2` à partir des informations sportives actuelles, puis les confronter à la calibration historique. Une correction doit rester justifiée : ne jamais forcer mécaniquement les nouvelles probabilités à reproduire les fréquences passées.

Lorsque la FDJ affiche la répartition des choix des joueurs, la relever dans `fdjSelectionDistribution`. Comparer pour chaque issue notre probabilité sportive à sa part dans les choix FDJ. L'écart `probabilité estimée - part FDJ` est un signal de valeur relatif : il peut révéler une issue sous-jouée ou surjouée par le public, mais ce n'est pas une espérance de gain exacte.

La concentration du public compte parce que les rapports dépendent du nombre de gagnants. À plausibilité sportive comparable, privilégier les scénarios moins surjoués peut améliorer le potentiel de rapport. Ne jamais choisir un outsider uniquement parce qu'il est peu joué : la plausibilité sportive reste obligatoire.

Pour les doubles confrontations, analyser explicitement le résultat du match présent dans la grille, et non la seule probabilité de qualification. Tenir compte du score de l'aller, de l'équipe qui doit attaquer, de celle qui peut gérer, des rotations plausibles et du risque qu'une équipe perde le retour tout en se qualifiant.

## Décision de mise et construction des combinaisons

Il n'existe aucun plafond arbitraire du nombre de combinaisons, mais chaque combinaison coûte 1 € virtuel.

Procéder dans cet ordre :

1. Construire les scénarios cohérents les plus plausibles à partir des probabilités de tous les matchs.
2. Confronter ces scénarios à la répartition FDJ lorsqu'elle est disponible et aux rapports historiques de la formule. Rechercher un compromis entre probabilité sportive et potentiel de rapport, sans prétendre connaître le rapport futur.
3. Décider d'abord s'il existe une raison financière crédible de miser sur cette grille. Si ce n'est pas le cas, publier l'analyse avec `betDecision.action = "skip"`, aucune combinaison et une mise virtuelle de 0 €.
4. Si une mise est justifiée, retenir le meilleur portefeuille initial avec `betDecision.action = "bet"`.
5. Avant chaque ticket supplémentaire, demander explicitement : « Ce ticket améliore-t-il de manière crédible la probabilité d'un résultat net positif compte tenu de son coût de 1 € ? » Si la réponse repose seulement sur davantage de couverture, ne pas l'ajouter.
6. Utiliser `recent20.ticketEconomics.additionalTickets` comme signal d'alerte. Si les tickets ajoutés ont récemment détruit de la valeur, exiger une justification actuelle particulièrement forte avant d'en ajouter.
7. Éviter les quasi-clones. Une variante doit représenter un scénario financier et sportif réellement distinct, pas seulement augmenter artificiellement la couverture.
8. Réévaluer après chaque ajout la mise totale, le rang payé historiquement nécessaire, le rapport historique indicatif, la concentration FDJ des choix concernés et la rentabilité marginale observée. Arrêter dès que le ticket suivant n'est plus justifié financièrement.

Le nombre final peut être `0`, `1` ou davantage. Il découle de la grille courante ; il ne doit jamais être choisi pour reproduire le nombre de tickets des publications précédentes.

## Prudence sur les rapports

Les rapports futurs sont inconnus avant le règlement. Les répartitions FDJ et les rapports historiques servent à estimer la valeur relative d'un scénario, pas à calculer une promesse de gain.

Ne jamais appeler « espérance de gain positive » un simple écart entre nos probabilités et les choix FDJ. Tant qu'un calcul complet du pool et de la distribution des combinaisons des autres joueurs n'est pas disponible, parler uniquement de signal de valeur ou de potentiel de rapport.

## Apprentissage continu

Après chaque nouveau règlement, la mémoire statistique est régénérée séparément par GitHub Actions. Le signal financier doit rester prioritaire : net, rendement, rentabilité des tickets ajoutés, puis seulement calibration, couverture et diversité.

Conserver `loto-foot-v1` comme `methodVersion`. Les nouveaux champs sont optionnels pour assurer la compatibilité avec l'historique, mais les nouvelles publications doivent renseigner `betDecision` et `fdjSelectionDistribution` lorsque la FDJ affiche cette dernière.
