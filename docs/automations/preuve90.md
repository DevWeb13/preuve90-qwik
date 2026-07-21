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

Enregistrer :

- l’URL exacte de la page consultée ;
- l’heure du relevé ;
- les participants ;
- l’heure de début ;
- toutes les issues du marché ;
- les cotes Betclic correspondantes.

Si une page ou une cote est inutilisable, ignorer ce candidat et poursuivre la recherche avec d’autres événements. Ne pas arrêter toute l’exécution au premier candidat incomplet.

## 3. Choisir au maximum un pronostic

Analyser les candidats trouvés à l’aide d’informations sportives publiques et récentes : forme, absences, niveau des participants, contexte, calendrier et autres facteurs pertinents.

Pour chaque candidat sérieux :

- estimer la probabilité de l’issue envisagée ;
- comparer cette probabilité au seuil implicite de la cote ;
- ne retenir le candidat que si l’espérance estimée est strictement positive ;
- expliquer brièvement les facteurs favorables et les incertitudes.

Publier au maximum le meilleur candidat défendable. Aucun pronostic n’est obligatoire si aucun candidat sérieux n’est trouvé.

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
- le pronostic publié ou la raison de l’absence de publication ;
- les cotes Betclic relevées et l’heure du relevé ;
- les fichiers créés ;
- le hash du commit GitHub ;
- les validations effectuées.

Ne jamais annoncer une publication tant que le nouveau fichier n’a pas été relu depuis `master`.
