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

8. Si plusieurs publications sont en attente, choisir la plus ancienne selon `publishedAt`.

9. Pour cette publication, rechercher auprès de FDJ les résultats et rapports officiels.

10. Une publication n’est réglable que lorsque les résultats et rapports officiels nécessaires sont complets, certains et non ambigus.

11. Rechercher également la prochaine grille officielle Loto Foot 7 dont la validation est encore ouverte.

12. Vérifier auprès de la source officielle :
    - le numéro de la grille ;
    - ses six ou sept matchs dans l’ordre ;
    - sa date et heure limites de validation.

13. Pour chaque match d’une nouvelle publication, rechercher des informations sportives récentes, fiables et publiques. Conserver le libellé, l’URL et la date d’accès de chaque source.

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

16. Produire une ou plusieurs combinaisons distinctes.

17. Chaque combinaison doit :
    - avoir un identifiant unique ;
    - contenir exactement autant de sélections que la grille contient de matchs ;
    - utiliser uniquement `1`, `N` ou `2` ;
    - posséder un libellé et une justification.

18. Chaque combinaison représente une mise strictement virtuelle de 100 centimes.

## Nouveau règlement

19. Produire uniquement les données officielles exigées par le modèle courant :
    - l’identifiant de la publication ;
    - le numéro de la grille ;
    - la date du règlement ;
    - l’URL officielle ;
    - les résultats `1`, `N` ou `2` dans l’ordre ;
    - les deux scores ou aucun score pour chaque match ;
    - les rapports officiels par nombre de bons choix ;
    - au moins une source officielle.

20. Lorsqu’un score est fourni, vérifier sa cohérence :
    - victoire à domicile : `1` ;
    - égalité : `N` ;
    - victoire à l’extérieur : `2`.

21. Ne jamais recopier dans le JSON les calculs dérivables par le code :
    - bons choix par combinaison ;
    - gains par combinaison ;
    - retour total ;
    - résultat net ;
    - statistiques cumulées.

22. Ne jamais inventer un rapport ou un seuil gagnant absent de la source officielle.

## Validation et écriture

23. Préparer au maximum un seul nouveau fichier JSON par exécution :
    - publication dans `src/content/loto-foot/publications/` ;
    - résultat dans `src/content/loto-foot/results/`.

24. Conserver le modèle actuel de chemin déterministe : une publication et son résultat utilisent le même nom de fichier dans leurs dossiers respectifs. L’identifiant du JSON doit correspondre exactement au nom de fichier sans l’extension `.json`.

25. Pour une publication, `publishedAt` doit être strictement antérieur à `validationDeadline`.

26. Pour un résultat, `settledAt` ne doit pas être antérieur à `validationDeadline`.

27. Contrôler le nouveau fichier avec les modèles et validations actuels du projet.

28. Si une donnée est incertaine, incomplète, ambiguë ou invalide, ne rien écrire et terminer normalement l’exécution.

29. Immédiatement avant toute écriture :
    - relire le `master` courant ;
    - relire `src/content/loto-foot/inventory.json` et refaire toutes les vérifications de l’étape 4 ;
    - relire et revalider uniquement les fichiers alors référencés par `pendingPublications` ;
    - tester directement avec l’app GitHub que le chemin déterministe du futur fichier n’existe pas ;
    - pour une publication, vérifier que son chemin n’est pas dans `publications` et qu’aucun nom de fichier de `publications` ne correspond déjà au même numéro de grille ;
    - pour un résultat, vérifier que la publication correspondante figure dans `pendingPublications` et que son chemin de résultat ne figure pas dans `results` ;
    - vérifier que l’identifiant prévu correspond exactement au nom du fichier sans extension.

30. En cas de doublon, d’incohérence, de désynchronisation connue de l’inventaire ou de changement incompatible, ne rien écrire, expliquer clairement la situation et terminer normalement. Ne pas attendre la synchronisation de l’inventaire pendant l’exécution et ne pas désactiver les prochaines exécutions.

31. Ajouter directement sur `master` uniquement le nouveau fichier JSON :
    - message `content: add ...` pour une publication ;
    - message `content: settle ...` pour un résultat.

32. Ne jamais modifier soi-même `src/content/loto-foot/inventory.json`. Après le commit métier, cet inventaire est synchronisé séparément par GitHub Actions.

33. Ne modifier aucun autre fichier, notamment :
    - une publication ou un résultat existant ;
    - le code ;
    - la configuration ;
    - la documentation ;
    - ce fichier d’instructions ;
    - la planification ChatGPT.

34. Après le commit :
    - relire le nouveau fichier depuis `master` ;
    - vérifier qu’il correspond exactement au contenu validé ;
    - fournir son chemin exact ;
    - fournir le hash complet du commit.

35. Lorsqu’aucune écriture n’est réalisée, expliquer brièvement pourquoi et laisser la planification active pour l’exécution suivante.
