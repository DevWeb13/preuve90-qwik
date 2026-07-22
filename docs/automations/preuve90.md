# Publication planifiée d’une grille Loto Foot 7

1. Se placer sur `master`, vérifier que l’arbre de travail est propre, puis lire la dernière version de `origin/master` avec une mise à jour fast-forward.
2. Lire les types, le calcul de mise, les validations et le chargeur actuels dans `src/content/loto-foot/`.
3. Lire tous les fichiers existants dans `src/content/loto-foot/publications/`. Ne jamais les modifier, les supprimer, les renommer ni réutiliser leur identifiant.
4. Rechercher la prochaine grille officielle Loto Foot 7 dont la validation est encore ouverte. Vérifier auprès de la source officielle son numéro, ses sept matchs dans l’ordre et sa date et heure limites.
5. Rechercher pour chacun des sept matchs des informations sportives récentes, fiables et publiques. Conserver l’URL, le libellé et la date d’accès de chaque source.
6. Analyser chaque match et produire trois probabilités entières `home`, `draw` et `away`, comprises entre 0 et 100 et totalisant exactement 100, un résumé, des facteurs principaux, une incertitude et au moins une source.
7. Choisir une ou plusieurs combinaisons distinctes. Chaque combinaison possède un identifiant unique et exactement sept sélections `1`, `N` ou `2`, indexées dans l’ordre des matchs, ainsi qu’un libellé et une justification.
8. Calculer la mise virtuelle totale avec la fonction actuelle du projet : nombre de combinaisons × 100 centimes. Ne pas définir de plafond. Aucun argent réel n’est joué et aucun gain n’est garanti.
9. Créer un seul nouveau fichier JSON dans `src/content/loto-foot/publications/`, conforme au modèle actuel, avec un identifiant de publication stable et unique. `publishedAt` doit être strictement antérieur à `validationDeadline`.
10. Vérifier que le fichier est publié avant la date limite et que la validation actuelle du projet l’accepte. Ne faire aucune requête réseau dans les tests.
11. Vérifier avec `git status` que le nouveau JSON est l’unique fichier ajouté ou modifié. La tâche ne doit modifier aucun fichier existant de contenu, code, configuration, documentation ou instructions.
12. Relire `origin/master` immédiatement avant le commit, intégrer uniquement une éventuelle avancée fast-forward, puis revérifier l’unicité du fichier, de l’identifiant et du numéro de grille.
13. Ajouter uniquement le nouveau JSON, créer directement sur `master` un commit dont le message commence par `content:`, puis pousser `master` vers `origin`.
14. Après le commit, relire le fichier depuis `master`, vérifier qu’il est identique au fichier validé, puis fournir son chemin exact et le hash complet du commit.

Cette autorisation de push direct sur `master` appartient uniquement à cette tâche planifiée et uniquement pour l’ajout d’un nouveau fichier JSON de contenu immuable. En cas de conflit, de grille incertaine, de date limite dépassée, de validation en échec ou de modification autre que cet ajout, ne pas committer ni pousser.
