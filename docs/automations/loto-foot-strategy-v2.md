# Stratégie Loto Foot v2 - Laboratoire virtuel

Ce document complète `docs/automations/preuve90.md` uniquement pour l'analyse sportive, la calibration des probabilités et les combinaisons virtuelles. `preuve90.md` reste prioritaire pour la sécurité, les sources obligatoires, la validation, l'écriture, la branche, la planification et le rapport.

## Mission et changement de logique

Preuve90 est une expérimentation ludique à mises exclusivement virtuelles. Son but est de tester des pronostics réellement publiés, observer leurs règlements, apprendre des erreurs et suivre le résultat net. Un rendement positif est une ambition mesurée après coup, **pas une preuve préalable exigée pour autoriser un ticket**.

L'ancienne exigence de « justification financière suffisamment convaincante » a entraîné 20 publications réglées consécutives sans ticket (constat dans la mémoire au 11/11/2026). Ce n'est pas une stratégie de pronostic exploitable. **Ne plus transformer automatiquement l'incertitude normale d'un match, l'historique déficitaire ou l'impossibilité de connaître les rapports futurs en décision `skip`.**

La publication d'une grille correctement vérifiée doit normalement donner au moins un ticket expérimental. Les tickets sont des hypothèses sportives à confronter aux résultats, pas des recommandations de paris réels. Aucun rendement, gain ou avantage financier n'est garanti.

## Mémoire statistique et apprentissage

Avant chaque grille, lire `docs/automations/loto-foot-strategy-stats.json` lorsqu'il existe. La mémoire est régénérée **séparément** après les règlements par GitHub Actions ; ne pas la modifier dans l'exécution de publication.

Examiner dans cet ordre :

1. `recent20.summary`, `recent20.strategySignals` et `allTime.strategySignals`, notamment `noBetPublications` et `consecutiveNoBetPublications` : repérer l'arrêt des expérimentations. Si `consecutiveNoBetPublications` est indisponible, utiliser `recent20.summary.noBetPublications` comme indicateur partiel sans en déduire un ordre exact.
2. `recent20.ticketEconomics`, `allTime.summary`, `allTime.byFormula`, `allTime.byTicketCount` : mesurer le coût des tickets et la rentabilité réelle, avec taille d'échantillon. Le rendement d'une période sans ticket est **non calculable**, et non une réussite à 0 %.
3. `recent20.calibration` et `allTime.calibration` : examiner l'écart entre probabilités annoncées et fréquences réalisées, par tranche suffisamment documentée. Ne pas confondre précision du favori et rentabilité des grilles.
4. `allTime.payoutHistory` : situer les rangs payants et l'extrême dispersion des rapports sans prédire un rapport futur.
5. `counterfactualTopPick` lorsque présent : comparer les publications réelles à un **témoin rétrospectif** composé, pour chaque grille, d'un seul ticket des issues les plus probables selon l'analyse initiale. `skippedOnly` indique ce qu'aurait donné ce témoin sur les grilles non jouées. Ce témoin est une simulation après règlement, **jamais une mise rétroactive ni une preuve de gain futur**.
6. `selectionDistribution` et la diversité : diagnostics secondaires, pas des objectifs indépendants.

Une ancienne perte virtuelle ne justifie ni de jouer à l'aveugle ni de ne plus jouer. Les anciennes combinaisons de 11 tickets ou plus ont été coûteuses : repartir sur de **petits portefeuilles explicables** et comparer les résultats.

## Analyse sportive et probabilités

Effectuer pour chaque rencontre toutes les vérifications demandées par `preuve90.md` : identité des équipes, contexte de la compétition, forme récente, domicile/extérieur, absences vérifiées, enchaînement des matchs, motivation, rotations probables, scores aller/retour lorsqu'ils changent l'approche du match, et contradictions entre sources.

Distinguer soigneusement les **faits sourcés**, les hypothèses et les informations non confirmées. Ne jamais inventer une composition, une blessure, une statistique ou une cote. La FDJ identifie les grilles et la répartition des joueurs, sans servir de source sportive unique.

Attribuer à chaque match des probabilités `1/N/2` entières totalisant 100. Réexaminer les probabilités au regard de la calibration historique et de la qualité des sources. Ne jamais appliquer mécaniquement le même correctif aux matchs ni ajuster après avoir vu leur résultat.

La répartition `fdjSelectionDistribution`, lorsqu'elle est affichée, compare notre analyse aux choix du public. Calculer les écarts issue par issue et, si pertinent, signaler une issue plausible sous-sélectionnée. **L'écart avec les choix du public n'est pas une probabilité de gain ni un calcul d'espérance de gain.** Une répartition FDJ absente, provisoire ou extrême ne suffit pas à décider `skip` dans les dernières 24 heures.

Pour les matchs aller/retour, pronostiquer le **résultat du match dans la grille**, pas la qualification finale. Les contraintes de score, la gestion d'une avance et les rotations peuvent faire diverger les deux.

## Construction des tickets - expérience reproductible

Pour toute grille dont l'identité et l'analyse peuvent être honnêtement confirmées :

1. **Ticket témoin principal (T1)** : construire une combinaison avec l'issue sportive la plus probable à chaque position, en cas d'égalité départager par les arguments sourcés. C'est un repère stable, pas une prétention de rentabilité.
2. **Scénario de valeur relative (facultatif)** : partir de T1, changer un petit nombre de rencontres réellement ouvertes en faveur d'issues sportivement plausibles et moins sélectionnées par le public. Expliquer les probabilités, la répartition FDJ utilisée, le risque supplémentaire et pourquoi cette hypothèse est distincte. Ne jamais choisir une issue à seule fin de faire un coup.
3. **Scénario sportif alternatif (facultatif)** : couvrir une autre lecture argumentée d'un ou deux matchs incertains (nul tactique, rotation documentée, outsider crédible), sans quasi-clone ni variation purement aléatoire.
4. Classer les candidats d'abord par plausibilité sportive, puis par intérêt expérimental distinct, puis par potentiel de rapport relatif **avec prudence**. Une approximation de la probabilité conjointe peut aider à comparer les tickets, mais l'indépendance des matchs n'est qu'une hypothèse simplificatrice.
5. Ne publier que les variantes dont la justification est **spécifique à la grille**. Pour chaque ticket, conserver dans `rationale` la raison des choix importants, la différence avec T1 et ce qu'on cherche à tester. N'inventer aucun ratio ni seuil de rentabilité vérifié.
6. Conserver le budget suivant pour permettre une comparaison dans le temps : LF7 et LF8, **1 à 3 tickets** normalement ; LF12 et LF15, **1 à 5 tickets** normalement. Chaque ticket vaut 1 € virtuel. Ce sont des **plafonds d'expérimentation**, jamais des cibles à remplir ; 1 ticket défendable vaut mieux que 5 variantes artificielles.

**Décision `bet` par défaut dès qu'une analyse sportive complète permet T1.** L'incertitude sportive ordinaire, le rendement historique négatif ou l'absence de démonstration d'espérance positive ne constituent pas des motifs de `skip` : ce sont précisément les risques à mesurer avec de l'argent fictif.

**Décision `skip` exceptionnelle**, uniquement si, malgré une recherche menée jusqu'au bout, aucune combinaison même expérimentale ne peut être défendue honnêtement sur des données exploitables. Donner un motif concret lié à cette grille et expliquer pourquoi même T1 serait trompeur. Lorsque l'identité d'un match ne peut pas être confirmée ou qu'une analyse honnête est impossible, appliquer plutôt le **blocage sans publication** prévu dans `preuve90.md`. Avant 24 heures, appliquer le report prévu dans `preuve90.md`, sans `skip` définitif.

Ne jamais jouer après la clôture, inventer des données, ajouter de mise réelle, créer des tickets en double ni réécrire les anciennes publications.

## Journal d'hypothèses et comparaison après règlement

L'historique existant est constitué des publications JSON immuables et des résultats officiels. Ne pas créer un second journal manuel qui pourrait diverger de cet historique.

Dans chaque nouvelle publication :

- `betDecision.rationale` explique le **mode expérimental**, le budget virtuel total, l'hypothèse principale et le risque le plus important ;
- T1 est identifiable comme ticket témoin ; les autres tickets portent une justification falsifiable, pas une promesse ;
- `matches[].analysis` explicite l'incertitude et conserve les sources datées ;
- `methodVersion` reste `loto-foot-v1` pour la compatibilité des schémas.

Au règlement suivant, lire les statistiques déterministes. Comparer progressivement T1, les variantes, le témoin contrefactuel, les calibrations, les mises et les rapports réellement réglés. Ne jamais faire passer un gain exceptionnel ou une série de pertes pour une preuve sur un petit échantillon. Ne jamais utiliser le résultat d'une grille future dans sa prédiction passée.

## Alerte anti-paralysie

**Dès 3 publications réglées consécutives à `skip`**, signaler explicitement « ALERTE : EXPÉRIMENTATION À L'ARRÊT » dans le rapport avec la valeur observée. **À partir de 5**, classer l'alerte comme critique, examiner la cause des abstentions et expliquer pourquoi la stratégie n'a pas produit de ticket. Le diagnostic ne remplace pas la vérification de la grille courante, ni ne permet de forcer un pronostic infondé.

À l'inverse, signaler une dérive de dépenses virtuelles ou une calibration faible sans bloquer automatiquement toute publication. L'alerte doit être **visible dans le rapport de la conversation**, y compris lorsque aucun fichier n'a été créé. Ne jamais prétendre avoir envoyé une notification push si son envoi n'a pas été vérifié.

## Rappel sur les rapports FDJ

Les rapports futurs et la distribution exacte des autres combinaisons sont inconnus. Les rapports passés, parts FDJ et écarts de probabilités sont des indications, non des garanties. Pour un ticket expérimental, présenter une **hypothèse sportive** et un **risque assumé**, pas une espérance financière prétendument démontrée.
