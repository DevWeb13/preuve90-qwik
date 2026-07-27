# Publication et règlement planifiés des grilles Loto Foot

## Règle absolue concernant la planification

Ne jamais suspendre, désactiver, modifier, supprimer ou recréer la planification ChatGPT.

Une exécution sans écriture, une information indisponible ou un blocage temporaire ne doit jamais
arrêter les prochaines exécutions. La gestion de la planification appartient uniquement à
l'utilisateur.

## Sources FDJ utiles

- grilles ouvertes :
  `https://www.pointdevente.parionssport.fdj.fr/grilles/ouvertes/loto-foot` ;
- prochaines grilles :
  `https://www.pointdevente.parionssport.fdj.fr/grilles/prochaines/loto-foot` ;
- règles :
  `https://www.pointdevente.parionssport.fdj.fr/aide/comprendre-pari/loto-foot`.

Les prochaines grilles servent uniquement à anticiper. Une grille ne peut être publiée que lorsqu'elle
figure dans les grilles ouvertes.

Formules autorisées :

- LF7 : 6 ou 7 matchs ;
- LF8 : 7 ou 8 matchs ;
- LF12 : 9, 10, 11 ou 12 matchs ;
- LF15 : 12, 13, 14 ou 15 matchs.

Toujours relever la formule officielle. Ne pas la déduire uniquement du nombre de matchs.

## Recherche

La recherche est libre. Consulter toute source publique utile, notamment FDJ, clubs, ligues,
fédérations, médias, bases de données sportives, sites de statistiques, bookmakers, cotes, marchés,
comparateurs et sites de pronostics.

Croiser les informations lorsque cela améliore l'analyse, mais ne pas imposer un nombre fixe de
sources. Une source claire peut suffire. En cas de doute ou de contradiction, poursuivre la recherche
jusqu'à obtenir une information cohérente.

Les sources externes servent à informer l'analyse. Les probabilités et les combinaisons publiées
restent celles produites par l'IA. Il n'est jamais nécessaire qu'une source externe fournisse des
probabilités pour chaque rencontre.

Une source qui ne couvre qu'une partie de la grille ne constitue pas un blocage. Poursuivre la
recherche avec d'autres sources publiques et synthétiser les informations disponibles. L'absence d'un
site unique couvrant toute la grille n'est jamais, à elle seule, un motif de refus.

## À chaque exécution

1. Utiliser l'app GitHub connectée sur le dépôt `DevWeb13/preuve90-qwik` et relire la version la plus
   récente de `master`.

2. Lire sur `master` :
   - `src/content/loto-foot/model.ts` ;
   - `src/content/loto-foot/validation.ts` ;
   - `src/content/loto-foot/publications.ts` ;
   - `src/content/loto-foot/result-validation.ts` ;
   - `src/content/loto-foot/results.ts` ;
   - `src/content/loto-foot/settlement.ts` ;
   - `src/content/loto-foot/statistics.ts` ;
   - `src/content/loto-foot/inventory.json`.

3. Vérifier que l'inventaire :
   - utilise la version `2` ;
   - contient des tableaux triés et sans doublon ;
   - référence des fichiers JSON valides dans les bons dossiers ;
   - relie correctement publications, résultats et publications en attente.

4. Lire les fichiers de `pendingPublications` et valider leurs champs essentiels. Les publications
   historiques `lf7-91-2026-07-22` et `lf7-92-2026-07-24` sans `formula` sont traitées en formule 7.

5. Pour chaque publication en attente :
   - avant ou exactement à `validationDeadline`, ne rechercher aucun résultat ;
   - strictement après `validationDeadline`, rechercher les signes gagnants et les rapports ;
   - créer le règlement dès que ces informations sont complètes et cohérentes.

6. Consulter les grilles ouvertes et les prochaines grilles des quatre formules. Les prochaines
   grilles servent seulement à anticiper. Seules les grilles ouvertes sont candidates à une
   publication.

7. Une grille est déjà publiée lorsque le couple `formula + gridNumber` existe. Ne jamais republier ce
   couple.

8. Traiter toutes les actions métier réalisables découvertes pendant l'exécution. Les priorités
   déterminent uniquement l'ordre des tentatives et ne limitent jamais l'exécution à une seule action :
   1. nouvelles grilles ouvertes non publiées qui risquent de fermer avant la prochaine exécution,
      classées par clôture croissante ;
   2. règlements éligibles, du plus ancien `publishedAt` au plus récent ;
   3. autres nouvelles grilles ouvertes non publiées, classées par clôture croissante.

   Pour des clôtures strictement identiques, départager les nouvelles grilles dans l'ordre LF7, LF8,
   LF12, LF15.

9. Lorsqu'une action ne peut pas être terminée honnêtement, relever précisément son blocage, la marquer
   comme non réalisable pour l'exécution courante et continuer immédiatement avec l'action suivante.
   Un règlement incomplet, une recherche insuffisante pour une grille ou une source indisponible ne
   doit jamais bloquer les autres règlements ou publications réalisables.

10. Continuer jusqu'à ce que chaque action découverte ait été soit réalisée, soit explicitement
    bloquée. Avant de terminer, consulter une dernière fois les grilles ouvertes et vérifier qu'aucune
    nouvelle action réalisable n'a été omise. Ne pas retenter indéfiniment la même action bloquée au
    cours d'une seule exécution, sauf si une nouvelle information fiable apparaît entre-temps.

11. Interrompre globalement les écritures uniquement si l'inventaire ou un fichier métier est invalide,
    absent ou désynchronisé, ou si une incohérence empêche de garantir l'intégrité du dépôt. Expliquer
    alors brièvement le problème et laisser la planification active.

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
