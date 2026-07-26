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
restent celles produites par l'IA.

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

8. Choisir au maximum une action métier, dans cet ordre :
   1. nouvelle grille ouverte non publiée qui risque de fermer avant la prochaine exécution ;
   2. règlement de la plus ancienne publication éligible ;
   3. nouvelle grille ouverte non publiée dont la clôture est la plus proche ;
   4. aucune écriture.

9. Une publication en attente ne bloque jamais la découverte ou la publication d'une autre grille
   ouverte.

10. Interrompre sans écriture uniquement si l'inventaire ou un fichier métier est invalide, absent ou
    désynchronisé. Expliquer alors brièvement le problème et laisser la planification active.

## Nouvelle publication

11. Utiliser l'identifiant et le nom de fichier `lf<formule>-<numero>-<date>`, ajouter `formula` et
    utiliser exactement `loto-foot-v1` comme `methodVersion`.

12. Vérifier la cohérence entre la formule, le numéro, le nom du fichier, le nombre de matchs et
    l'absence de doublon.

13. Pour chaque match, produire :
    - trois probabilités entières `home`, `draw` et `away` totalisant exactement 100 ;
    - un résumé, les facteurs principaux et une incertitude ;
    - une analyse fondée sur les informations jugées utiles pendant la recherche.

14. Utiliser librement les informations disponibles : forme récente, classement, absences,
    compositions, calendrier, contexte, statistiques, cotes, mouvements de marché, avis et
    pronostics externes. L'IA choisit elle-même les éléments utiles et produit sa propre analyse.

15. Produire librement une ou plusieurs combinaisons distinctes. Utiliser le plus petit nombre qui
    couvre les scénarios jugés plausibles. Chaque combinaison :
    - possède un identifiant, un libellé et une justification ;
    - contient exactement autant de choix que la publication contient de matchs ;
    - utilise uniquement `1`, `N` ou `2`.

16. Chaque combinaison représente 100 centimes, soit 1 € de mise virtuelle. La mise totale est
    `nombre de combinaisons x 100 centimes`.

17. Pour les horodatages :
    - utiliser l'heure réelle en Europe/Paris avec les secondes ;
    - relever chaque `accessedAt` au moment réel de la consultation ;
    - relever `publishedAt` immédiatement avant la validation et l'écriture ;
    - garantir `accessedAt <= publishedAt < validationDeadline` ;
    - ne jamais écrire un horodatage futur.

## Nouveau règlement

18. Le résultat utilise le même nom de fichier que sa publication dans
    `src/content/loto-foot/results/`. Ne pas dupliquer `formula`.

19. Rechercher la suite complète des signes gagnants `1`, `N` ou `2` de la grille et les rapports.
    Chercher où cela fonctionne. Utiliser FDJ lorsqu'elle fournit clairement l'information, sinon
    utiliser immédiatement une autre source publique claire.

20. Ne pas rechercher les scores précis des rencontres. Les scores sont inutiles au règlement et leur
    absence ne doit jamais bloquer l'écriture.

21. Une seule source claire peut suffire. Recouper seulement en cas de doute, d'incohérence ou de
    contradiction.

22. Dès que la suite complète des signes gagnants et les rapports sont disponibles, créer le fichier
    de règlement. Ne pas différer l'écriture pour obtenir davantage de preuves.

23. Produire uniquement :
    - `publicationId` et `gridNumber` identiques à la publication ;
    - `settledAt >= validationDeadline` ;
    - l'URL officielle FDJ de la grille ;
    - autant de résultats ordonnés que la publication contient de matchs ;
    - les sélections `1`, `N` ou `2`, sans scores ;
    - les rapports ;
    - les sources réellement utilisées.

24. Ne jamais inventer un signe ou un rapport. En cas de contradiction réelle non résolue, ne rien
    écrire et expliquer précisément la contradiction.

## Validation et écriture

25. Préparer au maximum un seul nouveau fichier JSON métier :
    - publication dans `src/content/loto-foot/publications/` ;
    - résultat dans `src/content/loto-foot/results/`.

26. Immédiatement avant l'écriture :
    - relire `master`, l'inventaire et ses `pendingPublications` ;
    - refaire les contrôles utiles ;
    - vérifier que le futur chemin n'existe pas ;
    - valider le fichier avec le modèle courant ;
    - écrire immédiatement.

27. Ne jamais modifier, supprimer ou renommer un contenu métier existant. Ne jamais réutiliser un
    identifiant. En cas de doublon ou d'incohérence, ne rien écrire.

28. Ajouter directement sur `master` uniquement le nouveau fichier métier :
    - `content: add ...` pour une publication ;
    - `content: settle ...` pour un résultat.

    Ne modifier ni le code, ni la configuration, ni la documentation, ni la planification pendant
    cette exécution. Ne jamais modifier `inventory.json` manuellement : GitHub Actions le synchronise.

29. Après le commit, relire le nouveau fichier sur `master` et fournir :
    - la formule, le numéro, le nombre de matchs et la clôture ;
    - le chemin exact et le hash complet du commit ;
    - le nombre de combinaisons et la mise totale pour une publication ;
    - `methodVersion` pour une publication ;
    - les principales sources utilisées ;
    - l'état synthétique des trois autres formules ;
    - la confirmation que l'inventaire est synchronisé séparément.

Ne jamais annoncer une synchronisation ou un déploiement comme terminé sans l'avoir vérifié.
Lorsqu'aucune écriture n'est réalisée, expliquer brièvement pourquoi et laisser la planification
active.
