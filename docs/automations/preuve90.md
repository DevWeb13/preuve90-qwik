# Publication et règlement planifiés des grilles Loto Foot

## Règle absolue concernant la planification

Ne jamais suspendre, désactiver, modifier, supprimer ou recréer la planification ChatGPT.

Un blocage temporaire, une absence de nouvelle grille, des résultats indisponibles ou une exécution
sans écriture ne doivent jamais arrêter les prochaines exécutions. La gestion de la planification
appartient uniquement à l’utilisateur.

## Sources officielles

Utiliser comme sources de vérité :

- grilles ouvertes :
  `https://www.pointdevente.parionssport.fdj.fr/grilles/ouvertes/loto-foot` ;
- prochaines grilles :
  `https://www.pointdevente.parionssport.fdj.fr/grilles/prochaines/loto-foot` ;
- règles :
  `https://www.pointdevente.parionssport.fdj.fr/aide/comprendre-pari/loto-foot`.

La page des prochaines grilles sert uniquement à anticiper les échéances et à identifier les
formules futures. Elle ne constitue jamais une autorisation de publier. Une grille ne peut devenir
candidate à une publication que lorsqu’elle figure officiellement dans les grilles ouvertes.

Les formules autorisées et leurs nombres de matchs sont :

- LF7 : 6 ou 7 ;
- LF8 : 7 ou 8 ;
- LF12 : 9, 10, 11 ou 12 ;
- LF15 : 12, 13, 14 ou 15.

La formule officielle doit toujours être relevée explicitement. Ne jamais la déduire uniquement du
nombre de matchs.

## Recherche et preuves

La recherche peut consulter librement les sources publiques utiles pour découvrir, vérifier ou
recouper une information.

Une source consultée n’est pas nécessairement une source à enregistrer. Les informations finalement
utilisées doivent être appuyées par les sources les plus fiables disponibles, en privilégiant :

1. FDJ et les organisateurs officiels ;
2. clubs, ligues, fédérations et compétitions officielles ;
3. médias sportifs reconnus ;
4. données sportives neutres et vérifiables ;
5. autres sources uniquement pour découvrir ou recouper une meilleure source.

Une page de pronostics, de paris, de cotes, de bookmaker ou d’affiliation commerciale peut servir
uniquement à découvrir une piste. Ne jamais reprendre ni enregistrer son pronostic, ses probabilités,
ses cotes ou sa recommandation.

## À chaque exécution

1. Utiliser l’app GitHub connectée sur le dépôt `DevWeb13/preuve90-qwik` et relire la version la
   plus récente de `master`.

2. Lire directement sur `master` :
   - `src/content/loto-foot/model.ts` ;
   - `src/content/loto-foot/validation.ts` ;
   - `src/content/loto-foot/publications.ts` ;
   - `src/content/loto-foot/result-validation.ts` ;
   - `src/content/loto-foot/results.ts` ;
   - `src/content/loto-foot/settlement.ts` ;
   - `src/content/loto-foot/statistics.ts` ;
   - `src/content/loto-foot/inventory.json`.

3. Vérifier l’inventaire avant de l’utiliser :
   - `version` vaut exactement `2` ;
   - `publications`, `results` et `pendingPublications` sont des tableaux triés sans doublon ;
   - leurs chemins utilisent leur dossier attendu, désignent directement un `.json`, sans
     sous-dossier ni segment `..` ;
   - chaque nom respecte `lf<formule>-<numero>-<date>.json` avec une formule autorisée ;
   - chaque chemin en attente figure dans `publications` et n’a pas de fichier homonyme dans
     `results` ;
   - chaque publication absente de `pendingPublications` possède un résultat homonyme.

4. Lire uniquement les fichiers référencés par `pendingPublications`. Pour chacun, relever et
   valider `formula`, `gridNumber`, `publishedAt` et `validationDeadline`. Seules les publications
   historiques `lf7-91-2026-07-22` et `lf7-92-2026-07-24` sans `formula` sont traitées en formule 7
   selon la normalisation du chargeur courant.

5. Pour chaque publication en attente :
   - avant ou exactement à `validationDeadline`, ne rechercher aucun résultat, score ou rapport ;
   - strictement après `validationDeadline`, elle devient seulement éligible à la recherche ;
   - ne la régler que lorsque tous les résultats et rapports nécessaires sont complets, certains et
     non ambigus selon les règles de la section « Nouveau règlement ».

6. Consulter séparément les grilles ouvertes et les prochaines grilles des quatre formules :
   - utiliser les prochaines grilles uniquement pour anticiper les échéances et identifier les
     formules futures ;
   - ne jamais lancer de recherche sportive détaillée ni publier une grille seulement annoncée
     comme prochaine ;
   - une telle grille peut seulement être mentionnée dans le rapport comme future grille non encore
     ouverte ;
   - utiliser uniquement les grilles ouvertes comme candidates à une nouvelle publication ;
   - confirmer sur la page officielle des grilles ouvertes la formule, le numéro, la composition
     complète, l’ordre des matchs et la clôture avant toute recherche sportive détaillée.

   Une publication en attente ne bloque jamais la découverte d’une nouvelle grille ouverte de la
   même formule.

7. Considérer une grille déjà publiée avec le couple `formula + gridNumber`. Un même numéro peut
   exister sur deux formules différentes. Ne jamais refaire l’analyse d’un couple déjà publié.

8. Choisir au maximum une action métier, dans cet ordre :
   1. nouvelle grille ouverte et non publiée risquant de fermer avant la prochaine exécution ;
   2. règlement de la plus ancienne publication éligible ;
   3. nouvelle grille ouverte et non publiée dont la clôture est la plus proche ;
   4. aucune écriture.

   Pour les règlements, « plus ancienne » signifie le plus ancien `publishedAt`. Pour les nouvelles
   grilles, départager une clôture strictement identique dans l’ordre LF7, LF8, LF12, LF15.

9. Ne faire les recherches sportives détaillées que pour la grille ouverte effectivement choisie,
   après confirmation complète sur la source officielle ouverte. Ne pas analyser en détail les
   autres grilles ouvertes ni les prochaines grilles découvertes pendant la même exécution.

10. Interrompre sans écriture, expliquer le blocage et laisser la planification active si
    l’inventaire est invalide, si un fichier en attente est absent ou invalide, ou si une
    désynchronisation connue est détectée.

## Nouvelle publication

11. Utiliser l’identifiant et le nom de fichier
    `lf<formule>-<numero>-<date>`, ajouter obligatoirement `formula` et utiliser exactement
    `loto-foot-v1` comme `methodVersion`. Ne jamais employer l’alias historique `v1` pour un nouveau
    fichier. Refuser toute publication si la grille ne figure pas encore dans les grilles ouvertes.

12. Vérifier la cohérence entre la formule, l’identifiant, le préfixe du fichier, le numéro et le
    nombre de matchs autorisé. Vérifier le doublon avec `formula + gridNumber`.

13. Pour chaque match, produire :
    - trois probabilités entières `home`, `draw` et `away` totalisant exactement 100 ;
    - un résumé, des facteurs principaux et une incertitude ;
    - au moins une information sportive récente, publique et directement pertinente pour cette
      rencontre ou pour les équipes concernées, appuyée par une source enregistrable fiable.

14. Hiérarchie des sources enregistrées :
    1. grille officielle FDJ ;
    2. clubs, ligues, fédérations et compétitions officielles ;
    3. médias sportifs reconnus ;
    4. données sportives neutres et vérifiables ;
    5. autres sources uniquement en complément.

    Ne jamais reprendre les probabilités ou le pronostic d’un autre site. FDJ reste la source de
    vérité pour la formule, le numéro, la composition des matchs, leur ordre et la clôture.

    Ne jamais enregistrer comme source d’analyse une page dont l’objet principal est un pronostic,
    une cote, un pari sportif, un comparateur de bookmakers ou une affiliation commerciale. Ne
    jamais enregistrer de lien vers un bookmaker.

    Les pourcentages de répartition affichés par FDJ décrivent les choix des joueurs. Ils ne sont
    pas les probabilités de l’IA et ne doivent pas servir à construire l’analyse ou les combinaisons.

    Un classement général, une projection de début de saison ou une source générique peut compléter
    l’analyse, mais ne doit pas constituer à lui seul toute la recherche d’un match.

    Lorsque les sources directement consacrées au match sont rares, recouper plusieurs informations
    fiables sur les résultats récents, le classement, le calendrier, les absences, les compositions
    ou le contexte sportif, puis signaler clairement la faiblesse documentaire dans `uncertainty`.

    Refuser la publication uniquement si les informations disponibles ne permettent pas une analyse
    honnête, cohérente et vérifiable de l’ensemble de la grille.

15. Produire librement une ou plusieurs combinaisons distinctes, sans nombre par défaut ni plafond
    arbitraire de trois. Utiliser le plus petit nombre couvrant les scénarios plausibles réellement
    justifiés. Chaque combinaison :
    - possède un identifiant, un libellé et une justification ;
    - contient exactement autant de choix que la publication contient de matchs ;
    - utilise uniquement `1`, `N` ou `2`.

16. Chaque combinaison représente exactement 100 centimes, soit 1 € de mise virtuelle. La mise
    totale est `nombre de combinaisons × 100 centimes`.

17. Pour les horodatages :
    - utiliser l’heure réelle en Europe/Paris, au format ISO avec les secondes ;
    - relever `accessedAt` au moment réel où chaque source précise est consultée ;
    - conserver ensuite cet horodatage sans le modifier ;
    - ne relever un nouvel `accessedAt` pour une source que si cette même source est réellement
      rouverte, et remplacer alors uniquement l’horodatage correspondant à cette nouvelle
      consultation ;
    - ne jamais appliquer après les recherches un horodatage final commun à toutes les sources ;
    - après toutes les recherches et les dernières consultations, relever, immédiatement avant la
      validation et l’écriture, une nouvelle heure courante réelle destinée à `publishedAt` ;
    - garantir `accessedAt <= publishedAt < validationDeadline` ;
    - ne jamais arrondir, estimer ou anticiper `publishedAt`, et ne jamais écrire un horodatage
      futur.

## Nouveau règlement

18. Le résultat utilise le même nom de fichier que sa publication, dans
    `src/content/loto-foot/results/`. Ne pas dupliquer `formula` : elle provient de la publication.

19. Les rapports et montants gagnants doivent provenir d’une publication officielle FDJ.

20. Pour chaque rencontre, rechercher la sélection gagnante dans cet ordre :
    1. page ou données officielles FDJ ;
    2. score final publié par la compétition, la ligue, la fédération ou l’un des clubs ;
    3. à défaut, deux sources sportives indépendantes, fiables et concordantes.

    La conversion d’un score final certain en sélection est autorisée et ne constitue pas une
    déduction interdite :
    - victoire de l’équipe à domicile : `1` ;
    - match nul : `N` ;
    - victoire de l’équipe à l’extérieur : `2`.

    Enregistrer les deux scores lorsqu’ils sont disponibles. Le validateur doit confirmer leur
    cohérence avec la sélection.

21. Ne pas régler une rencontre si son résultat reste ambigu, notamment en cas de report,
    annulation, abandon, décision sur tapis vert incertaine ou contradiction entre les sources
    fiables.

22. Produire uniquement :
    - `publicationId` identique à la publication ;
    - `gridNumber` identique ;
    - `settledAt >= validationDeadline` ;
    - l’URL officielle FDJ ;
    - autant de résultats ordonnés que la publication contient de matchs ;
    - les sélections `1`, `N` ou `2`, avec deux scores cohérents ou aucun score ;
    - les rapports officiels, sans niveau dépassant le nombre réel de matchs ;
    - au moins une source officielle.

23. Ne jamais inventer de résultat ni de rapport, et ne jamais stocker un calcul dérivable : bons
    choix par combinaison, gains calculés, retour total, résultat net ou statistiques cumulées.

## Validation et écriture

24. Préparer au maximum un seul nouveau fichier JSON métier :
    - publication dans `src/content/loto-foot/publications/` ;
    - résultat dans `src/content/loto-foot/results/`.

25. Immédiatement avant l’écriture :
    - relire `master`, l’inventaire et uniquement ses `pendingPublications` ;
    - refaire les contrôles des étapes 3 à 7 ;
    - vérifier directement avec l’app GitHub que le futur chemin n’existe pas ;
    - pour une publication, respecter strictement cet ordre final :
      1. terminer toutes les recherches ;
      2. terminer les dernières consultations en conservant pour chacune l’heure `accessedAt`
         relevée lors de son ouverture réelle, sans horodatage final commun ;
      3. relever ensuite l’heure courante réelle en Europe/Paris destinée à `publishedAt`, avec les
         secondes, immédiatement avant la validation et l’écriture, sans arrondi, estimation ni
         heure future ;
      4. valider le fichier avec le modèle courant ;
      5. écrire immédiatement le fichier.

26. Ne jamais modifier, supprimer ou renommer un contenu existant. Ne jamais réutiliser un
    identifiant. En cas de doublon, d’ambiguïté ou d’incohérence, ne rien écrire.

27. Ajouter directement sur `master` uniquement le nouveau fichier métier :
    - `content: add ...` pour une publication ;
    - `content: settle ...` pour un résultat.

    Ne modifier ni le code, ni la configuration, ni la documentation, ni la planification pendant
    cette exécution. Ne jamais modifier soi-même `inventory.json` : GitHub Actions le synchronise
    séparément.

28. Après le commit, relire le nouveau fichier sur `master` et fournir :
    - formule, numéro, nombre de matchs et clôture ;
    - chemin exact et hash complet du commit ;
    - nombre de combinaisons et mise totale pour une publication ;
    - `methodVersion` pour une publication ;
    - qualité et hiérarchie des sources ;
    - pour une publication, confirmation que chaque `accessedAt <= publishedAt` et que `publishedAt`
      n’est pas postérieur à l’horodatage GitHub du commit ;
    - état synthétique des trois autres formules ;
    - confirmation que l’inventaire est synchronisé séparément.

    Ne jamais prétendre que la synchronisation de l’inventaire ou un déploiement est terminé sans
    l’avoir vérifié. Une grille seulement présente dans les prochaines grilles peut être signalée
    comme future grille non encore ouverte, sans recherche sportive détaillée et sans publication.

    Lorsqu’aucune écriture n’est réalisée, expliquer brièvement pourquoi et laisser la planification
    active.
