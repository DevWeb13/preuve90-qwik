# Tâche planifiée Preuve90

## Objectif

À chaque exécution :

1. régler les pronostics terminés qui n’ont pas encore de résultat ;
2. chercher ensuite un événement sportif commençant prochainement ;
3. publier au maximum un nouveau pronostic ;
4. ajouter directement les nouveaux fichiers JSON sur la branche `master`.

Preuve90 utilise uniquement une mise virtuelle fixe de 5 EUR. Aucun pari réel n’est placé et aucun gain n’est promis.

## Accès au projet

Travailler avec GitHub sur le dépôt `DevWeb13/preuve90-qwik`, branche `master`.

Avant toute écriture :

- lire la version la plus récente de `master` ;
- lire les types et validations actuels du dépôt ;
- charger tous les fichiers présents dans `src/content/predictions/` et `src/content/settlements/` ;
- vérifier qu’aucun identifiant de pronostic ou d’événement n’existe déjà.

Ne jamais modifier, supprimer ou renommer un pronostic ou un règlement existant.

## 1. Régler les pronostics terminés

Pour chaque pronostic terminé qui n’a pas encore de règlement :

- rechercher le résultat final auprès d’une source publique fiable ;
- privilégier une source officielle lorsque celle-ci est disponible ;
- vérifier les participants, la date et le résultat ;
- ajouter un règlement `WON`, `LOST` ou `VOID` conforme au schéma actuel du dépôt ;
- enregistrer l’URL exacte de la source utilisée.

Si un résultat particulier est ambigu, laisser uniquement ce pronostic en attente et continuer le traitement des autres pronostics.

Ajouter chaque règlement dans un nouveau fichier sous `src/content/settlements/`.

## 2. Rechercher un pronostic

Rechercher activement sur le Web des événements sportifs :

- commençant entre 30 minutes et 8 heures après la recherche ;
- non commencés et non proposés en direct ;
- tous sports et pays autorisés ;
- avec un marché simple `h2h` à deux ou trois issues ;
- avec des cotes clairement attribuées à Betclic France.

Ne pas se limiter à l’ouverture directe de `betclic.fr`.

Les cotes Betclic peuvent être relevées :

- sur une page publique de Betclic ;
- sur une page publique de comparaison de cotes ;
- sur une autre page publique qui indique clairement les cotes de Betclic France.

Les différentes issues du marché doivent provenir du même relevé Betclic. Ne jamais mélanger les meilleures cotes de plusieurs bookmakers.

### Procédure prioritaire de collecte des cotes

Commencer par découvrir plusieurs événements situés dans la fenêtre autorisée à partir de calendriers, de pages de compétitions ou de moteurs de recherche.

Pour chaque événement candidat, rechercher ensuite en priorité sa page détaillée sur Wincomparator en utilisant les noms exacts des deux participants.

Toujours ouvrir la page consacrée au match ou à la rencontre. Ne pas se limiter :

- à l’extrait affiché dans les résultats du moteur de recherche ;
- à une page générale de compétition ;
- à une liste de rencontres ;
- à un bloc `Top paris` ;
- à un tableau présentant uniquement les meilleures cotes de plusieurs bookmakers.

Ces éléments peuvent servir à découvrir des événements, mais ils ne permettent jamais de conclure qu’une ligne Betclic est complète ou incomplète.

Sur la page détaillée de l’événement, rechercher la section correspondant au marché demandé, notamment :

- `Cotes résultat (1N2)` pour un marché à trois issues ;
- `Cotes vainqueur` pour un marché à deux issues ;
- toute section équivalente présentant les bookmakers ligne par ligne.

Dans cette section, rechercher la ligne explicitement attribuée à `Betclic` ou `Betclic France`.

Relever toutes les issues et toutes les cotes présentes sur cette seule ligne.

Lorsqu’une ligne Betclic complète est présente sur la page détaillée, ne jamais rejeter l’événement au motif que le bloc `Top paris`, la page de compétition ou une autre partie de la page mélange plusieurs bookmakers.

Si la page détaillée Wincomparator ne contient pas de ligne Betclic complète, si la ligne n’est plus disponible ou si son contenu est inaccessible, consulter ensuite au moins deux autres sources publiques pertinentes pour le même événement.

Ne rejeter définitivement un événement pour absence de ligne Betclic complète qu’après avoir :

1. ouvert sa page détaillée ;
2. recherché la ligne Betclic dans le tableau par bookmaker ;
3. consulté au moins deux autres sources publiques lorsque cette ligne est absente ou inaccessible.

Examiner les pages détaillées d’au moins cinq événements distincts situés dans la fenêtre autorisée lorsque cinq événements ou plus sont disponibles.

Une page, une cote ou un événement inutilisable ne doit jamais arrêter toute l’exécution. Poursuivre avec les autres candidats disponibles.

Pour chaque ligne Betclic complète, enregistrer :

- l’URL exacte de la page détaillée consultée ;
- l’heure du relevé ;
- les participants ;
- le sport et la compétition ;
- l’heure de début ;
- toutes les issues du marché ;
- toutes les cotes Betclic correspondantes ;
- le nom de la section dans laquelle la ligne a été trouvée.

## 3. Choisir au maximum un pronostic

Analyser les candidats disposant d’une ligne Betclic complète à l’aide d’informations sportives publiques et récentes :

- forme récente ;
- absences ;
- niveau des participants ;
- surface ou lieu de la rencontre ;
- calendrier ;
- fatigue ;
- confrontations pertinentes ;
- contexte sportif ;
- autres facteurs utiles.

Ne jamais utiliser automatiquement comme probabilité finale la seule estimation affichée par un comparateur. La probabilité retenue doit être réévaluée et justifiée à partir des informations sportives consultées.

Pour chaque candidat sérieux :

- choisir l’issue envisagée ;
- estimer sa probabilité ;
- calculer le seuil implicite de la cote avec `1 / cote` ;
- calculer l’espérance estimée avec `probabilité × cote - 1` ;
- ne retenir le candidat que si l’espérance estimée est strictement positive et suffisamment défendable ;
- expliquer brièvement les facteurs favorables ;
- expliquer les principales incertitudes.

Publier au maximum le meilleur candidat défendable.

Aucun pronostic n’est obligatoire si aucun candidat sérieux ne présente une espérance positive suffisamment crédible.

L’identifiant de l’événement doit être stable :

- utiliser l’identifiant public de la source lorsqu’il existe ;
- sinon créer un identifiant déterministe à partir de la date, du sport et des participants.

Créer le pronostic en respectant exactement le type `Prediction` et les validations actuelles du dépôt.

La provenance reste :

```json
{
  "provider": "betclic-public",
  "eventId": "identifiant-de-levenement",
  "reference": "URL publique exacte du relevé"
}
```

Dans ce contexte, `betclic-public` signifie que les cotes Betclic ont été observées publiquement. La page référencée peut être une page Betclic ou une page publique qui attribue clairement ces cotes à Betclic France.

Ajouter le pronostic dans un nouveau fichier sous `src/content/predictions/`.

## 4. Publier sur GitHub

Écrire les nouveaux pronostics et règlements directement sur la branche `master`.

- Ne créer aucune branche.
- Ne créer aucune pull request.
- Ne modifier aucun autre fichier.
- Regrouper les nouveaux fichiers dans un même commit lorsque cela est possible.
- Utiliser un message de commit clair commençant par `content:`.
- Après l’écriture, relire chaque nouveau fichier depuis GitHub.
- Vérifier le commit créé et confirmer que seuls les nouveaux fichiers JSON attendus ont été ajoutés.

Ne jamais modifier ce fichier d’instructions pendant une exécution.

## Rapport final

Toujours indiquer :

- les règlements examinés et ajoutés ;
- les événements et sources principales consultés ;
- le nombre de pages détaillées d’événements examinées ;
- le pronostic publié ou la raison de l’absence de publication ;
- les cotes Betclic relevées et l’heure du relevé ;
- les fichiers créés ;
- le hash du commit GitHub ;
- les validations effectuées.

En cas d’absence de publication, détailler au minimum les trois meilleurs candidats examinés, ou tous les candidats s’il y en avait moins de trois.

Pour chacun de ces candidats, indiquer :

- l’événement et son heure de début ;
- l’URL exacte de la page détaillée ;
- la section de cotes consultée ;
- la présence ou l’absence d’une ligne Betclic complète ;
- toutes les cotes de la ligne Betclic lorsqu’elle existe ;
- l’issue envisagée ;
- la probabilité estimée ;
- le seuil implicite de la cote ;
- l’espérance estimée ;
- la raison exacte du rejet.

Ne pas écrire simplement qu’aucune ligne Betclic complète n’a été trouvée sans indiquer les pages détaillées effectivement ouvertes et les vérifications réalisées sur chacune.

Ne jamais annoncer une publication tant que le nouveau fichier n’a pas été relu depuis `master`.
