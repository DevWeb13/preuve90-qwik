# Stratégie Loto Foot v2

Ce document complète `docs/automations/preuve90.md` uniquement pour la méthode d'analyse, la calibration des probabilités et la construction des combinaisons. Toutes les règles de sécurité, de validation, d'écriture, de branche, de planification et de rapport de `preuve90.md` restent prioritaires.

## Mémoire statistique

Avant d'analyser une nouvelle grille, lire `docs/automations/loto-foot-strategy-stats.json` lorsqu'il existe.

Ce fichier est une mémoire statistique déterministe construite à partir des publications et résultats déjà réglés. Il sert à détecter les biais historiques du pronostiqueur sans relire toutes les anciennes grilles.

S'il est absent, invalide ou momentanément en retard sur le dernier règlement, ne jamais bloquer une publication pour cette seule raison. Effectuer l'analyse sportive normalement et signaler simplement que la mémoire statistique n'a pas pu être utilisée.

Utiliser en priorité :

- `recent20` pour les dérives récentes ;
- `allTime` pour éviter de sur-réagir à un petit échantillon ;
- `selectionDistribution.coverageGapPct` pour repérer une sous- ou sur-couverture persistante des choix `1`, `N` ou `2` ;
- `calibration` pour détecter une surconfiance ou une sous-confiance des probabilités annoncées ;
- `byTicketCount` et les signaux de diversité pour mesurer si les combinaisons supplémentaires ont réellement amélioré la couverture ;
- `payoutHistory` uniquement comme repère historique sur les rangs payés et les rapports observés, jamais comme promesse de rapport futur.

Ne jamais remplacer les informations sportives de la grille courante par ces statistiques historiques. Elles servent à calibrer la méthode, pas à inventer des faits sur un match.

## Analyse des rencontres

Continuer à effectuer la recherche complète demandée par `preuve90.md` pour chaque rencontre.

Produire les probabilités `1/N/2` à partir des informations actuelles, puis les confronter aux biais historiques de la mémoire statistique. Une correction de calibration doit rester justifiée : ne jamais forcer mécaniquement les nouvelles probabilités à reproduire les fréquences passées.

Pour les doubles confrontations, analyser explicitement le résultat du match présent dans la grille, et non la seule probabilité de qualification. Tenir compte du score de l'aller, de l'équipe qui doit attaquer, de celle qui peut gérer, des rotations plausibles et du risque qu'une équipe perde le retour tout en se qualifiant.

## Construction des combinaisons

Il n'existe aucun plafond arbitraire du nombre de combinaisons.

Le nombre de combinaisons doit être choisi dynamiquement en fonction de l'analyse, de la couverture réellement ajoutée par chaque combinaison et de la mise totale. Une combinaison supplémentaire coûte 1 € virtuel et doit donc apporter une valeur marginale identifiable.

Procéder ainsi :

1. Construire d'abord les scénarios cohérents les plus plausibles à partir des probabilités de tous les matchs, au lieu de créer uniquement une combinaison centrale puis de modifier un match à la fois.
2. Identifier les rencontres réellement incertaines et les scénarios de nuls ou de surprises que les combinaisons déjà retenues couvrent mal.
3. Ajouter une nouvelle combinaison seulement si elle couvre un scénario plausible insuffisamment représenté et améliore de manière crédible la probabilité d'atteindre un rang payé.
4. Éviter les quasi-clones. Une variante qui ne change qu'un seul match n'est acceptable que si ce match concentre à lui seul une incertitude déterminante et si la variante apporte une couverture que les autres combinaisons n'apportent pas. En règle générale, les combinaisons supplémentaires doivent différer sur plusieurs rencontres lorsque l'incertitude est répartie sur la grille.
5. Utiliser la mémoire statistique pour corriger les biais observés, notamment une éventuelle sous-couverture des nuls, des outsiders ou une surconfiance dans certains favoris.
6. Réévaluer le portefeuille après chaque ajout : mise totale, diversité, scénarios couverts, rang payé historiquement nécessaire pour cette formule et rapport historique indicatif. Arrêter d'ajouter des combinaisons lorsqu'une nouvelle combinaison n'améliore plus suffisamment la couverture par rapport à son coût.

## Objectif financier

L'objectif n'est pas de maximiser le nombre brut de bonnes réponses ni de minimiser artificiellement la mise. L'objectif expérimental est d'augmenter la probabilité d'un résultat net positif.

Si `T` combinaisons sont publiées, la mise virtuelle totale est `T €`. La construction finale doit donc viser un retour potentiel supérieur à `T €` et ne pas augmenter la mise simplement pour multiplier des variantes proches.

Les rapports futurs étant inconnus avant le règlement, ne jamais présenter ce calcul comme une espérance de gain certaine. Utiliser les rapports historiques de la mémoire statistique comme ordre de grandeur seulement, avec prudence, et privilégier la probabilité d'atteindre un rang payé avec un portefeuille réellement diversifié.

## Apprentissage continu

Après chaque nouveau règlement, la mémoire statistique est régénérée séparément par GitHub Actions. Le pronostiqueur n'a pas à relire tout l'historique : il utilise le fichier résumé lors de son prochain passage.

Conserver `loto-foot-v1` comme `methodVersion` tant que le modèle de données et la validation l'exigent. Cette stratégie v2 modifie la méthode de décision, pas le schéma des publications.
