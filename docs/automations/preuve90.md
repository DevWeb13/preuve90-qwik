## À chaque exécution

1. Travailler sur la branche `master` du dépôt `DevWeb13/preuve90-qwik` et lire `src/content/loto-foot/inventory.json`.

   Si l’inventaire ne peut pas être lu, ne rien écrire et signaler l’erreur.

   Pendant cette exécution :
   - créer uniquement de nouveaux fichiers JSON dans `publications/` ou `results/` ;
   - ne modifier ni les contenus existants, ni le code, ni la configuration, ni la documentation, ni la planification ;
   - ne jamais modifier `inventory.json` manuellement.

2. Traiter les publications en attente dont la clôture est passée, de la plus ancienne à la plus récente.

   Pour chacune :
   - lire le fichier de la publication concernée ;
   - rechercher la suite complète des signes gagnants `1`, `N` ou `2` et les rapports ;
   - utiliser la FDJ lorsque les informations sont clairement disponibles, sinon consulter une autre source publique claire ;
   - ne pas rechercher les scores, qui ne sont pas nécessaires au règlement ;
   - ne jamais inventer un signe ou un rapport.

   Si les informations sont incomplètes ou contradictoires, noter précisément la raison et continuer avec la publication suivante.

   Lorsqu’elles sont complètes et cohérentes :
   - lire `model.ts` et `result-validation.ts` ;
   - créer dans `src/content/loto-foot/results/` un fichier portant le même nom que la publication ;
   - utiliser les mêmes `publicationId` et `gridNumber` ;
   - utiliser un `settledAt` postérieur ou égal à `validationDeadline` ;
   - fournir autant de sélections ordonnées que la publication contient de matchs ;
   - ajouter les rapports et les sources réellement utilisées ;
   - ne pas ajouter `formula` ni les scores.

   Immédiatement avant l’écriture :
   - relire `master` et `inventory.json` ;
   - vérifier que le résultat n’existe pas déjà ;
   - valider le fichier avec le modèle courant.

   Ajouter uniquement ce fichier sur `master` dans un commit nommé `content: settle ...`.

   Après le commit :
   - relire le fichier depuis `master` ;
   - vérifier son contenu et le hash complet du commit ;
   - vérifier la synchronisation de `inventory.json` et le déploiement ;
   - ne passer à l’écriture suivante qu’après la synchronisation de l’inventaire.

3. Consulter la liste officielle des grilles ouvertes et traiter les grilles non publiées par ordre de clôture, de la plus proche à la plus éloignée.

   Pour chacune :
   - vérifier dans l’inventaire qu’une publication ayant la même formule et le même numéro n’existe pas déjà ;
   - effectuer pour chaque rencontre la recherche définie dans la section « Recherche » ;
   - si une rencontre ne peut pas faire l’objet d’une analyse honnête, noter précisément la raison et continuer avec la grille suivante.

   Lorsque l’analyse est complète :
   - lire `model.ts` et `validation.ts` ;
   - utiliser l’identifiant et le nom de fichier `lf<formule>-<numero>-<date>` ;
   - renseigner la formule officielle et utiliser `loto-foot-v1` comme `methodVersion` ;
   - vérifier la cohérence entre la formule, le numéro, le nom du fichier et le nombre de matchs.

   Pour chaque rencontre, produire :
   - les probabilités entières `home`, `draw` et `away`, totalisant exactement 100 ;
   - un résumé ;
   - les principaux facteurs ;
   - une incertitude ;
   - les sources réellement utilisées.

   Produire une ou plusieurs combinaisons distinctes :
   - avec un identifiant, un libellé et une justification ;
   - contenant exactement un choix par rencontre ;
   - utilisant uniquement `1`, `N` ou `2` ;
   - en conservant le plus petit nombre de combinaisons couvrant les scénarios jugés plausibles.

   Chaque combinaison représente une mise virtuelle de 100 centimes. La mise totale correspond au nombre de combinaisons multiplié par 100 centimes.

   Pour les horodatages :
   - utiliser l’heure réelle en Europe/Paris avec les secondes ;
   - relever chaque `accessedAt` au moment de la consultation ;
   - relever `publishedAt` immédiatement avant la validation et l’écriture ;
   - garantir `accessedAt <= publishedAt < validationDeadline` ;
   - ne jamais utiliser un horodatage futur.

   Immédiatement avant l’écriture :
   - relire `master` et `inventory.json` ;
   - vérifier à nouveau que la grille et le futur chemin n’existent pas ;
   - valider le fichier avec le modèle courant.

   Ajouter uniquement cette publication dans `src/content/loto-foot/publications/`, sur `master`, dans un commit nommé `content: add ...`.

   Après le commit :
   - relire le fichier depuis `master` ;
   - vérifier son contenu et le hash complet du commit ;
   - vérifier la synchronisation de `inventory.json` et le déploiement ;
   - ne passer à l’écriture suivante qu’après la synchronisation de l’inventaire.

4. À la fin de l’exécution, fournir un rapport unique indiquant :
   - chaque publication ou règlement créé, avec sa formule, son numéro, son chemin et le hash complet du commit ;
   - pour chaque publication, le nombre de matchs, la clôture, le nombre de combinaisons et la mise virtuelle totale ;
   - pour chaque règlement, les rapports et les principales sources utilisées ;
   - chaque action bloquée et sa raison précise ;
   - l’état vérifié de la synchronisation de l’inventaire et des déploiements.

   Lorsqu’aucune écriture n’a été réalisée, expliquer brièvement pourquoi.

   Ne jamais annoncer une synchronisation ou un déploiement comme terminé sans l’avoir vérifié.
