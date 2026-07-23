# Publication et règlement planifiés des grilles Loto Foot 7

À chaque exécution :

1. Avec l’accès GitHub au dépôt, relire la version la plus récente de `master`.
2. Lire sur `master` les modèles, calculs, validations et chargeurs présents dans `src/content/loto-foot/`, puis tous les JSON existants sous `src/content/loto-foot/publications/` et `src/content/loto-foot/results/`. Ne jamais modifier, supprimer ou renommer un fichier existant, ni réutiliser un identifiant.
3. Identifier les publications qui n’ont pas encore de résultat. Pour la plus ancienne candidate, rechercher auprès de FDJ le résultat et les rapports officiels. Ne la considérer comme réglable que si tous les résultats, les éventuels scores enregistrés, les rapports et leurs sources sont officiels, complets et non ambigus.
4. Rechercher également la prochaine grille officielle Loto Foot 7 dont la validation est encore ouverte. Vérifier auprès de la source officielle son numéro, ses six ou sept matchs dans l’ordre et sa date et heure limites. Pour chaque match, rechercher des informations sportives récentes, fiables et publiques en conservant l’URL, le libellé et la date d’accès.
5. Choisir une seule action selon cet ordre :
   - publier une nouvelle grille lorsque reporter sa publication à l’exécution suivante risquerait de dépasser sa clôture ;
   - sinon régler la plus ancienne publication éligible ;
   - sinon publier la prochaine grille ouverte éligible ;
   - sinon ne rien écrire.
6. Pour une publication, produire des probabilités entières `home`, `draw` et `away` totalisant exactement 100, un résumé, des facteurs, une incertitude et au moins une source par match. Produire une ou plusieurs combinaisons uniques de six ou sept sélections `1`, `N` ou `2`, exactement aussi longues que la liste des matchs. Chaque combinaison vaut 100 centimes virtuels.
7. Pour un règlement, produire uniquement les données officielles exigées par le modèle : référence de publication, numéro de grille, date de règlement, URL officielle, résultats ordonnés, les deux scores ou aucun pour chaque match, rapports par nombre de bons choix et au moins une source officielle. Ne jamais recopier les bons choix, gains par ticket, retours, résultats nets ou statistiques calculables par le code. Ne jamais imposer un seuil gagnant absent du rapport officiel.
8. Préparer au maximum un seul nouveau fichier JSON par exécution, sous `src/content/loto-foot/publications/` pour une publication ou `src/content/loto-foot/results/` pour un règlement. Utiliser un identifiant stable et unique. Pour une publication, `publishedAt` doit être strictement antérieur à `validationDeadline`. Pour un règlement, `settledAt` ne peut pas être antérieur à cette clôture.
9. Valider le fichier avec le code courant du projet, sans requête réseau dans les tests. Si une donnée est incertaine, incomplète, ambiguë ou invalide, ne rien écrire.
10. Immédiatement avant l’écriture, relire le `master` courant sur GitHub. Vérifier qu’il n’a pas changé de manière incompatible, que le chemin est libre et qu’aucun identifiant, numéro de grille de publication ou règlement de la publication n’existe déjà. En cas d’incompatibilité ou de doublon, ne rien écrire.
11. Ajouter directement sur `master`, avec l’accès GitHub, ce seul nouveau fichier. Utiliser `content: add ...` pour une publication et `content: settle ...` pour un résultat.
12. Après le commit, relire le fichier depuis `master`, vérifier qu’il correspond exactement au contenu validé, puis fournir son chemin et le hash complet du commit.

Cette autorisation d’écriture directe sur `master` appartient uniquement à cette tâche planifiée et uniquement à l’ajout d’un nouveau fichier JSON immuable dans l’un des deux dossiers autorisés. Elle n’autorise jamais la modification d’un contenu existant, du code, de la configuration, de la documentation, des instructions ou de la planification ChatGPT externe.
