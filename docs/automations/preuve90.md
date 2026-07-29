# Publication planifiée des grilles Loto Foot

## Planification

La planification doit rester active et ne doit jamais être modifiée par cette tâche, y compris lorsqu’une exécution ne produit aucune écriture ou rencontre un blocage temporaire.

## Sources FDJ

Source officielle des grilles ouvertes :
`https://www.pointdevente.parionssport.fdj.fr/grilles/ouvertes/loto-foot`

Seules les grilles figurant dans cette liste peuvent être publiées.

Documentation FDJ de référence :
`https://www.pointdevente.parionssport.fdj.fr/aide/comprendre-pari/loto-foot`

Formules autorisées :

- LF7 : 6 ou 7 matchs ;
- LF8 : 7 ou 8 matchs ;
- LF12 : 9, 10, 11 ou 12 matchs ;
- LF15 : 12, 13, 14 ou 15 matchs.

Relever la formule indiquée explicitement par la FDJ. Ne jamais déterminer la formule à partir du seul nombre de matchs, car certaines formules se chevauchent.

## Recherche

Agir comme un expert en analyse sportive et effectuer, pour chaque rencontre, toutes les recherches nécessaires afin de produire le pronostic le plus solide possible.

La page FDJ sert à identifier la grille, les rencontres et, lorsqu’elle l’affiche, la répartition des choix des joueurs. Elle ne doit jamais constituer la seule base d’une analyse sportive.

Croiser les informations utiles et conserver les sources réellement utilisées dans l’analyse.

Les probabilités et les combinaisons finales sont produites par l’IA à partir des informations recueillies.

## Règlements automatiques

Les règlements sont créés séparément par GitHub Actions à partir des résultats API-Football et des rapports FDJ. Cette planification ne doit jamais rechercher ni créer de règlement.

## À chaque exécution

1. Travailler sur la branche `master` du dépôt `DevWeb13/preuve90-qwik` et lire `src/content/loto-foot/inventory.json`.

   Si l’inventaire ne peut pas être lu, ne rien écrire et signaler l’erreur.

   Pendant cette exécution :
   - créer uniquement de nouveaux fichiers JSON dans `src/content/loto-foot/publications/` ;
   - ne modifier ni les contenus existants, ni le code, ni la configuration, ni la documentation, ni la planification ;
   - ne jamais modifier `inventory.json` manuellement.

2. Consulter la liste officielle des grilles ouvertes et traiter les grilles non publiées par ordre de clôture, de la plus proche à la plus éloignée.

   Traiter au maximum une grille complète par exécution afin d’éviter de commencer plusieurs analyses sans en terminer aucune. À date et heure de clôture identiques, traiter d’abord la grille contenant le moins de rencontres.

   Pour la grille prioritaire :
   - vérifier dans l’inventaire qu’une publication ayant la même formule et le même numéro n’existe pas déjà ;
   - effectuer pour chaque rencontre la recherche définie dans la section « Recherche » ;
   - si une rencontre ne peut pas faire l’objet d’une analyse honnête, noter précisément la raison et ne rien publier pour cette grille pendant cette exécution.

   Lorsque l’analyse est complète :
   - lire `src/content/loto-foot/model.ts` et `src/content/loto-foot/validation.ts` ;
   - utiliser l’identifiant et le nom de fichier `lf<formule>-<numero>-<date>` ;
   - renseigner la formule officielle et utiliser `loto-foot-v1` comme `methodVersion` ;
   - vérifier la cohérence entre la formule, le numéro, le nom du fichier et le nombre de matchs.

   Pour chaque rencontre, produire :
   - `startsAt`, avec la date et l’heure réelles du coup d’envoi ;
   - les probabilités entières `home`, `draw` et `away`, totalisant exactement 100 ;
   - un résumé, les principaux facteurs et une incertitude ;
   - les sources réellement utilisées.

   Produire une ou plusieurs combinaisons distinctes :
   - avec un identifiant, un libellé et une justification ;
   - contenant exactement un choix par rencontre ;
   - utilisant uniquement `1`, `N` ou `2` ;
   - choisir librement le nombre de combinaisons à partir de l’analyse, en tenant compte du coût de 1 € par combinaison afin de couvrir les scénarios plausibles tout en visant un rapport potentiel supérieur à la mise virtuelle totale.

   Chaque combinaison représente une mise virtuelle de 100 centimes.

   Pour les horodatages :

   - utiliser l’heure réelle en Europe/Paris avec les secondes ;
   - relever chaque `accessedAt` au moment de la consultation ;
   - relever `publishedAt` immédiatement avant la validation et l’écriture ;
   - garantir `accessedAt <= publishedAt < validationDeadline` ;
   - ne jamais utiliser un horodatage futur.

   ### Validation réalisable par la planification

   La validation préalable est une vérification structurelle et déterministe effectuée en lisant `model.ts` et `validation.ts`. L’absence d’un environnement local permettant d’exécuter TypeScript ne constitue jamais, à elle seule, un motif de blocage.

   Ne jamais refuser une publication au seul motif que la fonction `validateNewLotoFootPublication` ne peut pas être appelée littéralement. Reproduire ses contrôles avant l’écriture :

   - objet JSON valide et champs obligatoires non vides ;
   - `id` au format `lf<formule>-<numero>-<date>` et cohérent avec `formula` et `gridNumber` ;
   - `officialUrl` et toutes les URL de sources en HTTP ou HTTPS ;
   - `methodVersion` égal à `loto-foot-v1` ;
   - `publishedAt` strictement antérieur à `validationDeadline` ;
   - nombre de rencontres autorisé pour la formule officielle ;
   - positions entières, uniques, ordonnées exactement de 1 au nombre de rencontres ;
   - `startsAt` présent et horodatage valide pour chaque rencontre ;
   - probabilités entières entre 0 et 100 et somme exactement égale à 100 ;
   - résumé, incertitude, au moins un facteur et au moins une source par rencontre ;
   - chaque `accessedAt` inférieur ou égal à `publishedAt` ;
   - au moins une combinaison ;
   - identifiants de combinaisons uniques ;
   - exactement un choix `1`, `N` ou `2` par rencontre ;
   - aucune combinaison dupliquée.

   Immédiatement avant l’écriture :

   - relire `master` et `inventory.json` ;
   - vérifier à nouveau que la grille et le futur chemin n’existent pas ;
   - effectuer intégralement la validation structurelle ci-dessus ;
   - ne jamais considérer l’absence d’exécution locale de TypeScript comme un blocage si tous les contrôles peuvent être vérifiés à partir des fichiers et du JSON.

   Ajouter uniquement cette publication sur `master` dans un commit nommé `content: add ...`.

   Après le commit :

   - relire le fichier depuis `master` ;
   - vérifier son contenu et le hash complet du commit ;
   - vérifier la synchronisation de `inventory.json` et le déploiement avant de terminer l’exécution.

3. À la fin de l’exécution, fournir un rapport unique indiquant :
   - chaque publication créée, avec sa formule, son numéro, son chemin et le hash complet du commit ;
   - le nombre de matchs, la clôture, le nombre de combinaisons et la mise virtuelle totale ;
   - pour chaque rencontre, la liste exacte des sources réellement utilisées ;
   - chaque grille bloquée et sa raison précise ;
   - l’état vérifié de la synchronisation de l’inventaire et des déploiements.

   Lorsqu’aucune écriture n’a été réalisée, expliquer brièvement pourquoi.

   Ne jamais annoncer une synchronisation ou un déploiement comme terminé sans l’avoir vérifié.
