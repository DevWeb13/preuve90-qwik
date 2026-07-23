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

4. Lire tous les fichiers JSON existants dans :
   - `src/content/loto-foot/publications/`
   - `src/content/loto-foot/results/`

   Utiliser les fonctions GitHub de consultation du dépôt. Ne pas utiliser la recherche de code comme seule méthode de découverte.

   Si l’app GitHub ne permet temporairement pas de consulter ces fichiers, ne rien écrire, expliquer précisément le blocage et terminer normalement l’exécution sans désactiver la planification.

5. Ne jamais modifier, supprimer ou renommer une publication ou un résultat existant. Ne jamais réutiliser un identifiant.

6. Identifier les publications qui ne possèdent pas encore de résultat.

7. Pour la plus ancienne publication sans résultat, rechercher auprès de FDJ les résultats et rapports officiels.

8. Une publication n’est réglable que lorsque les résultats et rapports officiels nécessaires sont complets, certains et non ambigus.

9. Rechercher également la prochaine grille officielle Loto Foot 7 dont la validation est encore ouverte.

10. Vérifier auprès de la source officielle :
    - le numéro de la grille ;
    - ses six ou sept matchs dans l’ordre ;
    - sa date et heure limites de validation.

11. Pour chaque match d’une nouvelle publication, rechercher des informations sportives récentes, fiables et publiques. Conserver le libellé, l’URL et la date d’accès de chaque source.

12. Choisir au maximum une seule action par exécution, dans cet ordre :
    - publier une nouvelle grille lorsque la prochaine exécution risquerait d’avoir lieu après sa clôture ;
    - sinon régler la plus ancienne publication éligible ;
    - sinon publier la prochaine grille ouverte éligible ;
    - sinon ne rien écrire.

## Nouvelle publication

13. Produire pour chaque match :
    - trois probabilités entières `home`, `draw` et `away` totalisant exactement 100 ;
    - un résumé ;
    - des facteurs principaux ;
    - une incertitude ;
    - au moins une source publique.

14. Produire une ou plusieurs combinaisons distinctes.

15. Chaque combinaison doit :
    - avoir un identifiant unique ;
    - contenir exactement autant de sélections que la grille contient de matchs ;
    - utiliser uniquement `1`, `N` ou `2` ;
    - posséder un libellé et une justification.

16. Chaque combinaison représente une mise strictement virtuelle de 100 centimes.

## Nouveau règlement

17. Produire uniquement les données officielles exigées par le modèle courant :
    - l’identifiant de la publication ;
    - le numéro de la grille ;
    - la date du règlement ;
    - l’URL officielle ;
    - les résultats `1`, `N` ou `2` dans l’ordre ;
    - les deux scores ou aucun score pour chaque match ;
    - les rapports officiels par nombre de bons choix ;
    - au moins une source officielle.

18. Lorsqu’un score est fourni, vérifier sa cohérence :
    - victoire à domicile : `1` ;
    - égalité : `N` ;
    - victoire à l’extérieur : `2`.

19. Ne jamais recopier dans le JSON les calculs dérivables par le code :
    - bons choix par combinaison ;
    - gains par combinaison ;
    - retour total ;
    - résultat net ;
    - statistiques cumulées.

20. Ne jamais inventer un rapport ou un seuil gagnant absent de la source officielle.

## Validation et écriture

21. Préparer au maximum un seul nouveau fichier JSON par exécution :
    - publication dans `src/content/loto-foot/publications/` ;
    - résultat dans `src/content/loto-foot/results/`.

22. Utiliser un chemin et un identifiant stables et uniques.

23. Pour une publication, `publishedAt` doit être strictement antérieur à `validationDeadline`.

24. Pour un résultat, `settledAt` ne doit pas être antérieur à `validationDeadline`.

25. Contrôler le nouveau fichier avec les modèles et validations actuels du projet.

26. Si une donnée est incertaine, incomplète, ambiguë ou invalide, ne rien écrire et terminer normalement l’exécution.

27. Immédiatement avant toute écriture :
    - relire le `master` courant ;
    - relire les publications et résultats existants ;
    - vérifier que le chemin prévu est libre ;
    - vérifier que l’identifiant n’existe pas ;
    - vérifier que le numéro de grille n’est pas déjà publié ;
    - vérifier qu’aucun résultat n’existe déjà pour la publication.

28. En cas de doublon ou de changement incompatible, ne rien écrire et terminer normalement l’exécution.

29. Ajouter directement sur `master` uniquement le nouveau fichier JSON :
    - message `content: add ...` pour une publication ;
    - message `content: settle ...` pour un résultat.

30. Ne modifier aucun autre fichier, notamment :
    - une publication ou un résultat existant ;
    - le code ;
    - la configuration ;
    - la documentation ;
    - ce fichier d’instructions ;
    - la planification ChatGPT.

31. Après le commit :
    - relire le nouveau fichier depuis `master` ;
    - vérifier qu’il correspond exactement au contenu validé ;
    - fournir son chemin exact ;
    - fournir le hash complet du commit.

32. Lorsqu’aucune écriture n’est réalisée, expliquer brièvement pourquoi et laisser la planification active pour l’exécution suivante.
