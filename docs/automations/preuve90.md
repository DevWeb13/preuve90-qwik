# Publication et règlement planifiés des grilles Loto Foot 7

## Règle absolue concernant la planification

Ne jamais suspendre, désactiver, modifier, supprimer ou recréer la planification ChatGPT.

Un blocage temporaire, une absence de nouvelle grille, des résultats indisponibles ou une exécution sans écriture ne doivent jamais arrêter les prochaines exécutions.

La gestion de la planification appartient uniquement à l’utilisateur.

## À chaque exécution

1. Utiliser l’app GitHub connectée sur le dépôt `DevWeb13/preuve90-qwik`.

2. Relire la version la plus récente de la branche `master`.

3. Lire directement sur `master` les fichiers suivants par leur chemin exact :
   - `src/content/loto-foot/model.ts`
   - `src/content/loto-foot/validation.ts`
   - `src/content/loto-foot/publications.ts`
   - `src/content/loto-foot/result-validation.ts`
   - `src/content/loto-foot/results.ts`
   - `src/content/loto-foot/settlement.ts`
   - `src/content/loto-foot/statistics.ts`

4. Lire `src/content/loto-foot/inventory.json`, puis vérifier avant de l’utiliser :
   - que `version` vaut exactement `2` ;
   - que `publications`, `results` et `pendingPublications` sont présents et sont des tableaux ;
   - que chaque tableau est trié alphabétiquement et ne contient aucun doublon ;
   - que chaque chemin de `publications` commence exactement par `src/content/loto-foot/publications/` ;
   - que chaque chemin de `results` commence exactement par `src/content/loto-foot/results/` ;
   - que chaque chemin de `pendingPublications` commence exactement par `src/content/loto-foot/publications/` ;
   - que chaque chemin désigne directement un fichier `.json`, sans sous-dossier ni segment `..` ;
   - que chaque chemin de `pendingPublications` figure aussi dans `publications` ;
   - que, pour chaque publication en attente, aucun chemin portant le même nom de fichier ne figure dans `results` ;
   - que chaque publication absente de `pendingPublications` possède dans `results` un chemin portant le même nom de fichier.

5. Lire individuellement sur `master` uniquement les fichiers référencés par `pendingPublications`. Une publication déjà réglée ne doit pas être relue. Ne pas lire les anciens résultats uniquement pour reconstituer leur existence : les listes de l’inventaire servent à ce contrôle.

   Interrompre sans écriture, expliquer précisément le blocage et terminer normalement sans désactiver la planification si :
   - l’inventaire est absent ou invalide ;
   - une publication en attente est absente, inaccessible ou invalide ;
   - les identifiants ou chemins des publications en attente sont incohérents ;
   - une désynchronisation connue de l’inventaire est détectée.

6. Ne jamais modifier, supprimer ou renommer une publication ou un résultat existant. Ne jamais réutiliser un identifiant.

7. Utiliser :
   - `publications` pour connaître les chemins et identifiants de publication déjà utilisés ;
   - `results` pour connaître les chemins de résultat déjà utilisés ;
   - les seuls fichiers chargés depuis `pendingPublications` pour rechercher un règlement.

8. Si plusieurs publications sont en attente, choisir la plus ancienne selon `publishedAt`, puis lire sa `validationDeadline`.

9. Pour cette publication :
   - si l’heure courante est antérieure ou égale à `validationDeadline`, ne rechercher ni résultat, ni score, ni rapport officiel et la conserver comme publication en attente ;
   - seulement si l’heure courante est strictement postérieure à `validationDeadline`, rechercher auprès de FDJ les résultats et rapports officiels.

10. La clôture autorise uniquement le début de la recherche. Une publication n’est réglable que lorsque tous les matchs sont terminés et que les résultats et rapports officiels nécessaires sont disponibles, complets, certains et non ambigus.

11. Rechercher également la prochaine grille officielle Loto Foot 7 dont la validation est encore ouverte, y compris lorsqu’une publication en attente n’a pas encore atteint sa `validationDeadline`.

12. Vérifier auprès de la source officielle :
    - le numéro de la grille ;
    - ses six ou sept matchs dans l’ordre ;
    - sa date et heure limites de validation.

13. Pour chaque match d’une nouvelle publication, rechercher des informations sportives récentes, fiables et publiques selon cette hiérarchie :
    1. source officielle de la grille FDJ ;
    2. clubs, ligues, fédérations et compétitions officielles ;
    3. médias sportifs reconnus avec une page précise sur le match ou l’équipe ;
    4. sources de données sportives neutres et vérifiables ;
    5. autres sources uniquement en complément.

    Privilégier au moins une source primaire ou officielle lorsqu’elle existe. Utiliser des URL précises vers l’article, le résultat ou la page qui justifie l’information, plutôt qu’une page d’accueil. Recouper les affirmations importantes lorsque cela est raisonnablement possible.

    Ne jamais reprendre les probabilités ou le pronostic d’un autre site. Un site de pronostics, de paris ou d’affiliation ne peut jamais être l’unique fondement d’une analyse ; il peut seulement servir de source factuelle secondaire si l’information est confirmée ailleurs. Ne jamais présenter une source commerciale comme officielle.

    Conserver le libellé, l’URL précise et l’heure réelle d’accès de chaque source. Ne rien publier si les informations utiles sont trop faibles, contradictoires ou invérifiables. FDJ reste la source de vérité pour le numéro de grille, l’ordre des matchs et la clôture.

14. Choisir au maximum une seule action par exécution, dans cet ordre :
    - publier une nouvelle grille lorsque la prochaine exécution risquerait d’avoir lieu après sa clôture ;
    - sinon régler la plus ancienne publication éligible ;
    - sinon publier la prochaine grille ouverte éligible ;
    - sinon ne rien écrire.

## Nouvelle publication

15. Produire pour chaque match :
    - trois probabilités entières `home`, `draw` et `away` totalisant exactement 100 ;
    - un résumé ;
    - des facteurs principaux ;
    - une incertitude ;
    - au moins une source publique.

16. Utiliser exactement `loto-foot-v1` comme `methodVersion` pour toute nouvelle publication. Interdire toute autre valeur tant qu’une nouvelle méthode n’a pas été explicitement définie et documentée. Ne pas modifier les publications historiques ; lorsque des comparaisons ou regroupements sont nécessaires, traiter leur valeur historique `v1` comme un alias de `loto-foot-v1`.

17. Produire une ou plusieurs combinaisons distinctes, sans nombre par défaut et sans maximum arbitraire de trois. Une seule combinaison est valide si elle constitue le meilleur choix. N’ajouter une combinaison que pour couvrir un scénario supplémentaire distinct, plausible et réellement justifié.

18. Utiliser le plus petit nombre de combinaisons permettant la stratégie retenue. Arrêter d’en ajouter dès que leur valeur marginale estimée ne justifie plus 100 centimes de mise virtuelle supplémentaire, en tenant compte :
    - des probabilités estimées ;
    - de la confiance et de l’incertitude de chaque match ;
    - de la complémentarité entre les combinaisons ;
    - du coût virtuel supplémentaire ;
    - du risque de dilution de la mise.

    Ne jamais ajouter une combinaison uniquement pour augmenter artificiellement la couverture. L’objectif est d’améliorer le rendement net virtuel à long terme, sans garantir de victoire ni de rentabilité. Les rapports futurs étant inconnus, ne jamais prétendre avoir calculé avec certitude une espérance de gain positive.

19. Chaque combinaison doit :
    - avoir un identifiant unique ;
    - contenir exactement autant de sélections que la grille contient de matchs ;
    - utiliser uniquement `1`, `N` ou `2` ;
    - posséder un libellé et une justification.

20. Chaque combinaison représente exactement 100 centimes, soit 1 €, de mise strictement virtuelle. La mise totale d’une publication est égale au nombre de combinaisons multiplié par 100 centimes.

## Nouveau règlement

21. Produire uniquement les données officielles exigées par le modèle courant :
    - l’identifiant de la publication ;
    - le numéro de la grille ;
    - la date du règlement ;
    - l’URL officielle ;
    - les résultats `1`, `N` ou `2` dans l’ordre ;
    - les deux scores ou aucun score pour chaque match ;
    - les rapports officiels par nombre de bons choix ;
    - au moins une source officielle.

22. Lorsqu’un score est fourni, vérifier sa cohérence :
    - victoire à domicile : `1` ;
    - égalité : `N` ;
    - victoire à l’extérieur : `2`.

23. Ne jamais recopier dans le JSON les calculs dérivables par le code :
    - bons choix par combinaison ;
    - gains par combinaison ;
    - retour total ;
    - résultat net ;
    - statistiques cumulées.

24. Ne jamais inventer un rapport ou un seuil gagnant absent de la source officielle.

## Validation et écriture

25. Préparer au maximum un seul nouveau fichier JSON par exécution :
    - publication dans `src/content/loto-foot/publications/` ;
    - résultat dans `src/content/loto-foot/results/`.

26. Conserver le modèle actuel de chemin déterministe : une publication et son résultat utilisent le même nom de fichier dans leurs dossiers respectifs. L’identifiant du JSON doit correspondre exactement au nom de fichier sans l’extension `.json`.

27. Pour les horodatages d’une nouvelle publication :
    - utiliser l’heure réelle de l’exécution en Europe/Paris, au format ISO avec les secondes ;
    - ne jamais arrondir vers une minute future, ni inventer une heure approximative ;
    - enregistrer dans chaque `accessedAt` le moment réel où la source correspondante a été consultée ;
    - garantir que chaque `accessedAt` est inférieur ou égal à `publishedAt` ;
    - garantir que `publishedAt` est strictement antérieur à `validationDeadline`.

28. Pour un résultat, `settledAt` ne doit pas être antérieur à `validationDeadline`.

29. Contrôler le nouveau fichier avec les modèles et validations actuels du projet.

30. Si une donnée est incertaine, incomplète, ambiguë ou invalide, ne rien écrire et terminer normalement l’exécution.

31. Immédiatement avant toute écriture :
    - relire le `master` courant ;
    - relire `src/content/loto-foot/inventory.json` et refaire toutes les vérifications de l’étape 4 ;
    - relire et revalider uniquement les fichiers alors référencés par `pendingPublications` ;
    - tester directement avec l’app GitHub que le chemin déterministe du futur fichier n’existe pas ;
    - pour une publication, vérifier que son chemin n’est pas dans `publications` et qu’aucun nom de fichier de `publications` ne correspond déjà au même numéro de grille ;
    - pour un résultat, vérifier que la publication correspondante figure dans `pendingPublications` et que son chemin de résultat ne figure pas dans `results` ;
    - vérifier que l’identifiant prévu correspond exactement au nom du fichier sans extension ;
    - pour une publication, actualiser `publishedAt` avec une heure réelle qui n’est pas postérieure à l’heure courante, puis revalider tous les horodatages ;
    - si une source a été consultée après la valeur provisoire de `publishedAt`, recalculer `publishedAt` avant le commit ;
    - ne jamais créer un fichier dont un horodatage se situe dans le futur au moment de l’écriture.

32. En cas de doublon, d’incohérence, de désynchronisation connue de l’inventaire ou de changement incompatible, ne rien écrire, expliquer clairement la situation et terminer normalement. Ne pas attendre la synchronisation de l’inventaire pendant l’exécution et ne pas désactiver les prochaines exécutions.

33. Ajouter directement sur `master` uniquement le nouveau fichier JSON :
    - message `content: add ...` pour une publication ;
    - message `content: settle ...` pour un résultat.

34. Ne jamais modifier soi-même `src/content/loto-foot/inventory.json`. Après le commit métier, cet inventaire est synchronisé séparément par GitHub Actions.

35. Ne modifier aucun autre fichier, notamment :
    - une publication ou un résultat existant ;
    - le code ;
    - la configuration ;
    - la documentation ;
    - ce fichier d’instructions ;
    - la planification ChatGPT.

36. Après le commit :
    - relire le nouveau fichier depuis `master` ;
    - vérifier qu’il correspond exactement au contenu validé ;
    - fournir son chemin exact ;
    - fournir le hash complet du commit.

37. Après une nouvelle publication, inclure dans le rapport :
    - le numéro de la grille ;
    - le chemin exact du fichier ;
    - le hash complet du commit métier ;
    - la clôture ;
    - le nombre de combinaisons et la mise virtuelle totale correspondante ;
    - pourquoi ce nombre a été retenu et pourquoi aucune combinaison supplémentaire n’a été ajoutée ;
    - la valeur de `methodVersion` ;
    - la confirmation qu’aucun horodatage n’était futur au moment de l’écriture ;
    - un résumé de la qualité et de la hiérarchie des sources utilisées ;
    - le fait que la synchronisation de l’inventaire est effectuée séparément par GitHub Actions.

    Ne pas prétendre que le commit de synchronisation de l’inventaire ou le déploiement Vercel est terminé sans l’avoir effectivement vérifié. S’ils ont seulement été déclenchés, l’indiquer et préciser qu’ils restent à confirmer séparément.

38. Lorsqu’aucune écriture n’est réalisée, expliquer brièvement pourquoi et laisser la planification active pour l’exécution suivante.
