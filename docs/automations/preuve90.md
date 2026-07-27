# Publication et règlement planifiés des grilles Loto Foot

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

Agir comme un analyste sportif indépendant et rechercher, pour chaque rencontre, les informations publiques, récentes et vérifiables nécessaires pour produire le pronostic le plus solide possible.

La page FDJ sert à identifier la grille, les rencontres et, lorsqu’elle l’affiche, la répartition des choix des joueurs. Elle ne doit jamais constituer la seule base d’une analyse sportive.

Pour chaque rencontre, utiliser au moins une source sportive distincte de la FDJ. En cas de doute ou de contradiction, poursuivre et croiser la recherche jusqu’à obtenir une analyse cohérente.

Les probabilités et les combinaisons finales sont produites par l’IA à partir des informations recueillies.

## À chaque exécution

1. Travailler sur la branche `master` du dépôt `DevWeb13/preuve90-qwik` et lire `src/content/loto-foot/inventory.json`.

   Si l’inventaire ne peut pas être lu, ne rien écrire et signaler l’erreur.

2. Traiter les publications en attente dont la clôture est passée, de la plus ancienne à la plus récente.

   Pour chacune :
   - rechercher les signes gagnants et les rapports ;
   - lorsqu’ils sont complets et cohérents, lire `model.ts`, `result-validation.ts` et le fichier de la publication concernée, puis créer le règlement ;
   - si le règlement ne peut pas être créé, noter précisément la raison et continuer avec la publication suivante.

3. Consulter la liste officielle des grilles ouvertes et traiter les grilles non publiées par ordre de clôture, de la plus proche à la plus éloignée.

   Pour chacune :
   - vérifier dans l’inventaire qu’une publication ayant la même formule et le même numéro n’existe pas déjà ;
   - effectuer la recherche nécessaire au pronostic ;
   - lire `model.ts` et `validation.ts`, puis créer la publication si l’analyse est suffisamment solide et complète ;
   - si la publication ne peut pas être créée, noter précisément la raison et continuer avec la grille suivante.

## Nouvelle publication

12. Utiliser l'identifiant et le nom de fichier `lf<formule>-<numero>-<date>`, ajouter `formula` et
    utiliser exactement `loto-foot-v1` comme `methodVersion`.

13. Vérifier la cohérence entre la formule, le numéro, le nom du fichier, le nombre de matchs et
    l'absence de doublon.

14. Pour chaque match, produire :
    - trois probabilités entières `home`, `draw` et `away` totalisant exactement 100 ;
    - un résumé, les facteurs principaux et une incertitude ;
    - une analyse fondée sur les informations jugées utiles pendant la recherche.

15. Utiliser librement les informations disponibles : forme récente, classement, absences,
    compositions, calendrier, contexte, statistiques, cotes, mouvements de marché, avis et
    pronostics externes. L'IA choisit elle-même les éléments utiles et produit ses propres
    probabilités, son analyse et ses combinaisons.

    Ne jamais attendre qu'une source fournisse directement les probabilités finales. Lorsque les
    informations d'une première source sont partielles, consulter d'autres sources adaptées à chaque
    rencontre. Refuser une publication uniquement si, après une recherche raisonnable et diversifiée,
    une ou plusieurs rencontres ne peuvent toujours pas faire l'objet d'une analyse honnête.

16. Produire librement une ou plusieurs combinaisons distinctes. Utiliser le plus petit nombre qui
    couvre les scénarios jugés plausibles. Chaque combinaison :
    - possède un identifiant, un libellé et une justification ;
    - contient exactement autant de choix que la publication contient de matchs ;
    - utilise uniquement `1`, `N` ou `2`.

17. Chaque combinaison représente 100 centimes, soit 1 € de mise virtuelle. La mise totale est
    `nombre de combinaisons x 100 centimes`.

18. Pour les horodatages :
    - utiliser l'heure réelle en Europe/Paris avec les secondes ;
    - relever chaque `accessedAt` au moment réel de la consultation ;
    - relever `publishedAt` immédiatement avant la validation et l'écriture ;
    - garantir `accessedAt <= publishedAt < validationDeadline` ;
    - ne jamais écrire un horodatage futur.

## Nouveau règlement

19. Le résultat utilise le même nom de fichier que sa publication dans
    `src/content/loto-foot/results/`. Ne pas dupliquer `formula`.

20. Rechercher la suite complète des signes gagnants `1`, `N` ou `2` de la grille et les rapports.
    Chercher où cela fonctionne. Utiliser FDJ lorsqu'elle fournit clairement l'information, sinon
    utiliser immédiatement une autre source publique claire.

21. Ne pas rechercher les scores précis des rencontres. Les scores sont inutiles au règlement et leur
    absence ne doit jamais bloquer l'écriture.

22. Une seule source claire peut suffire. Recouper seulement en cas de doute, d'incohérence ou de
    contradiction.

23. Dès que la suite complète des signes gagnants et les rapports sont disponibles, créer le fichier
    de règlement. Ne pas différer l'écriture pour obtenir davantage de preuves.

24. Produire uniquement :
    - `publicationId` et `gridNumber` identiques à la publication ;
    - `settledAt >= validationDeadline` ;
    - l'URL officielle FDJ de la grille ;
    - autant de résultats ordonnés que la publication contient de matchs ;
    - les sélections `1`, `N` ou `2`, sans scores ;
    - les rapports ;
    - les sources réellement utilisées.

25. Ne jamais inventer un signe ou un rapport. En cas de contradiction réelle non résolue, ne pas
    écrire ce règlement, expliquer précisément la contradiction et continuer avec les autres actions
    réalisables.

## Validation et écriture

26. Préparer et écrire autant de nouveaux fichiers JSON métier distincts que d'actions réalisables :
    - publications dans `src/content/loto-foot/publications/` ;
    - résultats dans `src/content/loto-foot/results/`.

    Chaque fichier métier doit être écrit dans son propre commit. Ne jamais regrouper plusieurs
    publications ou règlements dans un même commit.

27. Immédiatement avant chaque écriture :
    - relire `master`, l'inventaire et ses `pendingPublications` ;
    - refaire les contrôles utiles ;
    - vérifier que le futur chemin n'existe pas ;
    - valider le fichier avec le modèle courant ;
    - écrire immédiatement.

28. Après chaque commit métier :
    - relire le nouveau fichier directement depuis `master` ;
    - vérifier le hash complet du commit et son contenu ;
    - vérifier la synchronisation séparée de `inventory.json` par GitHub Actions avant l'écriture
      métier suivante ;
    - si la synchronisation n'est pas encore terminée, ne jamais modifier l'inventaire manuellement.

29. Ne jamais modifier, supprimer ou renommer un contenu métier existant. Ne jamais réutiliser un
    identifiant. En cas de doublon ou d'incohérence concernant une action, ne pas l'écrire et continuer
    avec les autres actions réalisables lorsque l'intégrité du dépôt le permet.

30. Ajouter directement sur `master` uniquement un nouveau fichier métier par commit :
    - `content: add ...` pour une publication ;
    - `content: settle ...` pour un résultat.

    Ne modifier ni le code, ni la configuration, ni la documentation, ni la planification pendant
    cette exécution. Ne jamais modifier `inventory.json` manuellement : GitHub Actions le synchronise.

31. À la fin de l'exécution, fournir un rapport unique qui récapitule :
    - toutes les actions réalisées, avec formule, numéro, chemin exact et hash complet de chaque commit ;
    - le nombre de matchs, la clôture, `methodVersion`, le nombre de combinaisons et la mise totale pour
      chaque publication ;
    - les rapports et les principales sources pour chaque règlement ;
    - chaque action bloquée et sa raison précise ;
    - l'état synthétique des quatre formules ;
    - l'état vérifié de la synchronisation des inventaires et des déploiements concernés.

Ne jamais annoncer une synchronisation ou un déploiement comme terminé sans l'avoir vérifié.
Lorsqu'aucune écriture n'est réalisée, expliquer brièvement pourquoi et laisser la planification
active.
