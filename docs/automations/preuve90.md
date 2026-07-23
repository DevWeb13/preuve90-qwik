# Publication et règlement planifiés des grilles Loto Foot 7

## Règle absolue sur la planification

Ne jamais suspendre, désactiver, modifier, supprimer ou recréer la planification ChatGPT. La gestion de la planification appartient uniquement à l’utilisateur. Une exécution sans écriture ou bloquée doit se terminer normalement et laisser les exécutions suivantes actives.

## À chaque exécution

1. Utiliser l’app GitHub connectée sur le dépôt `DevWeb13/preuve90-qwik`, branche `master`, puis relire la version la plus récente de `master`.

2. Lire directement, par leurs chemins exacts, les fichiers suivants :

- `src/content/loto-foot/model.ts`
- `src/content/loto-foot/validation.ts`
- `src/content/loto-foot/result-validation.ts`
- `src/content/loto-foot/publications.ts`
- `src/content/loto-foot/results.ts`
- `src/content/loto-foot/settlement.ts`
- `src/content/loto-foot/statistics.ts`

Ne jamais tenter d’ouvrir ou d’énumérer un dossier GitHub comme s’il s’agissait d’un fichier. Ne jamais dépendre de la recherche de code pour découvrir les contenus existants.

3. Découvrir les publications et résultats existants avec l’historique Git de `master` :

- rechercher les commits dont le message commence par `content:` ;
- inspecter les fichiers ajoutés par ces commits ;
- conserver uniquement les fichiers JSON ajoutés sous `src/content/loto-foot/publications/` et `src/content/loto-foot/results/` ;
- lire ensuite chaque fichier retenu par son chemin exact ;
- lire aussi directement `src/content/loto-foot/publications/lf7-91-2026-07-22.json` lorsqu’il n’a pas déjà été trouvé.

Ne jamais modifier, supprimer ou renommer un contenu existant. Ne jamais réutiliser un identifiant.

4. Identifier les publications qui n’ont pas encore de résultat. Pour la plus ancienne candidate, rechercher auprès de FDJ les résultats et rapports officiels. Une grille n’est réglable que lorsque toutes les données nécessaires sont officielles, complètes et non ambiguës.

5. Rechercher également la prochaine grille officielle Loto Foot 7 encore ouverte. Vérifier auprès de la source officielle :

- son numéro ;
- ses six ou sept matchs dans l’ordre ;
- sa date et heure limites ;
- son URL officielle.

Pour chaque match, rechercher des informations sportives récentes, fiables et publiques, en conservant le libellé, l’URL et la date d’accès de chaque source.

6. Choisir au maximum une seule action selon cet ordre :

- publier une nouvelle grille lorsque reporter sa publication à l’exécution suivante risquerait de dépasser sa clôture ;
- sinon régler la plus ancienne publication éligible ;
- sinon publier la prochaine grille ouverte éligible ;
- sinon ne rien écrire.

7. Pour une publication :

- produire pour chaque match des probabilités entières `home`, `draw` et `away` comprises entre 0 et 100 et totalisant exactement 100 ;
- fournir un résumé, des facteurs principaux, une incertitude et au moins une source ;
- produire une ou plusieurs combinaisons uniques de `1`, `N` ou `2`, exactement aussi longues que la liste des matchs ;
- considérer chaque combinaison comme une mise strictement virtuelle de 100 centimes ;
- utiliser un identifiant et un chemin stables et uniques ;
- garantir que `publishedAt` est strictement antérieur à `validationDeadline`.

8. Pour un règlement :

- référencer exactement la publication concernée ;
- enregistrer le numéro de grille, `settledAt`, l’URL officielle, les résultats ordonnés et les rapports officiels ;
- enregistrer les deux scores ou aucun score pour chaque match ;
- garantir la cohérence entre le score et `1`, `N` ou `2` ;
- fournir au moins une source officielle ;
- ne jamais recopier les bons choix, gains par ticket, retours, résultats nets ou statistiques calculables par le code ;
- ne jamais inventer un seuil gagnant ou un rapport absent de la source officielle.

9. Valider le futur JSON en appliquant exactement les contraintes des modèles et validateurs lus à l’étape 2. Si une donnée est incertaine, incomplète, ambiguë ou invalide, ne rien écrire.

10. Immédiatement avant toute écriture :

- relire le `master` courant ;
- refaire la découverte des commits `content:` et des JSON ajoutés ;
- vérifier que le chemin prévu est libre ;
- vérifier que l’identifiant n’existe pas déjà ;
- vérifier que le numéro de grille n’existe pas déjà pour une publication ;
- vérifier qu’aucun résultat n’existe déjà pour la publication concernée.

En cas d’incompatibilité ou de doublon, ne rien écrire.

11. Ajouter directement sur `master` au maximum un seul nouveau fichier JSON :

- sous `src/content/loto-foot/publications/` pour une publication, avec un message `content: add ...` ;
- sous `src/content/loto-foot/results/` pour un règlement, avec un message `content: settle ...`.

Aucun autre fichier ne doit être créé ou modifié.

12. Après le commit, relire le nouveau fichier depuis `master`, vérifier qu’il correspond exactement au contenu validé, puis fournir :

- l’action réalisée ;
- le chemin exact ;
- le hash complet du commit ;
- les contrôles effectués.

## En cas d’absence d’action ou de blocage

Lorsqu’aucune grille ne peut être publiée ou réglée, ou lorsqu’une capacité GitHub, une permission ou une source officielle manque :

- ne rien écrire dans le dépôt ;
- indiquer précisément le blocage ou la raison de la non-publication ;
- terminer normalement l’exécution ;
- ne jamais intervenir sur la planification ChatGPT.

Cette autorisation d’écriture directe sur `master` appartient uniquement à cette tâche planifiée et uniquement à l’ajout d’un nouveau fichier JSON immuable dans l’un des deux dossiers autorisés.