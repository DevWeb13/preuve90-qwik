# Publication planifiée d’une grille Loto Foot 7

1. Avec l’accès GitHub au dépôt, lire la version la plus récente de la branche `master`.
2. Lire sur `master` les types, le calcul de mise, les validations et le chargeur présents dans `src/content/loto-foot/`.
3. Lire sur `master` tous les fichiers existants dans `src/content/loto-foot/publications/`. Ne jamais les modifier, les supprimer, les renommer ni réutiliser leur identifiant.
4. Rechercher la prochaine grille officielle Loto Foot 7 dont la validation est encore ouverte. Vérifier auprès de la source officielle son numéro, ses sept matchs dans l’ordre et sa date et heure limites.
5. Rechercher pour chacun des sept matchs des informations sportives récentes, fiables et publiques. Conserver l’URL, le libellé et la date d’accès de chaque source.
6. Analyser chaque match et produire trois probabilités entières `home`, `draw` et `away`, comprises entre 0 et 100 et totalisant exactement 100, un résumé, des facteurs principaux, une incertitude et au moins une source.
7. Choisir une ou plusieurs combinaisons distinctes. Chaque combinaison possède un identifiant unique et exactement sept sélections `1`, `N` ou `2`, indexées dans l’ordre des matchs, ainsi qu’un libellé et une justification.
8. Calculer la mise virtuelle totale avec la fonction actuelle du projet : nombre de combinaisons × 100 centimes. Ne pas définir de plafond. Aucun argent réel n’est joué et aucun gain n’est garanti.
9. Préparer exactement un nouveau fichier JSON destiné à `src/content/loto-foot/publications/`, conforme au modèle actuel, avec un identifiant de publication stable et unique. `publishedAt` doit être strictement antérieur à `validationDeadline`.
10. Vérifier que la publication intervient avant la date limite et que le contenu respecte les validations actuelles du projet. Ne faire aucune requête réseau dans les tests.
11. Immédiatement avant l’écriture, relire la version courante de `master` sur GitHub. Vérifier qu’elle n’a pas changé d’une manière incompatible, que le chemin prévu est libre et que l’identifiant ainsi que le numéro de grille n’existent pas déjà. En cas d’incompatibilité ou de doublon, ne rien écrire.
12. Ajouter directement sur `master`, avec l’accès GitHub, ce seul nouveau fichier dans `src/content/loto-foot/publications/`. Utiliser un message de commit commençant par `content:`.
13. Ne modifier, supprimer ou renommer aucun fichier existant, y compris les publications, le code, la configuration, la documentation et les instructions.
14. Après le commit, relire le nouveau fichier depuis `master`, vérifier qu’il correspond au contenu validé, puis fournir son chemin exact et le hash complet du commit.

Cette autorisation d’écriture directe sur `master` appartient uniquement à cette tâche planifiée et uniquement pour l’ajout d’un nouveau fichier JSON de contenu immuable. En cas de grille incertaine, de date limite dépassée, de validation en échec, de changement incompatible sur `master` ou de modification autre que cet ajout, ne rien écrire dans le dépôt.
