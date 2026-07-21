# Tâche planifiée Preuve90

## Objectif

À chaque exécution :

1. régler les pronostics terminés qui n’ont pas encore de résultat ;
2. rechercher des événements sportifs à venir ;
3. publier au maximum un nouveau pronostic ;
4. ajouter les nouveaux fichiers JSON directement sur la branche `master`.

Preuve90 utilise uniquement une mise virtuelle fixe de 5 EUR. Aucun pari réel n’est placé et aucun gain n’est promis.

## Accès au projet

Travailler avec GitHub sur le dépôt `DevWeb13/preuve90-qwik`, branche `master`.

Avant toute écriture :

- lire la version la plus récente de `master` ;
- lire les types et validations actuels du dépôt ;
- charger tous les fichiers de `src/content/predictions/` et `src/content/settlements/` ;
- vérifier qu’aucun identifiant de pronostic ou d’événement n’existe déjà.

Ne jamais modifier, supprimer ou renommer un pronostic ou un règlement existant.

## 1. Régler les pronostics terminés

Pour chaque pronostic dont l’événement est terminé et qui ne possède pas encore de règlement :

- rechercher le résultat final auprès d’une source publique fiable ;
- privilégier la source officielle de la compétition, du tournoi ou de l’organisateur ;
- vérifier les participants, la date et le résultat final ;
- ajouter un règlement `WON`, `LOST` ou `VOID` conforme au schéma actuel ;
- enregistrer l’URL exacte de la source utilisée.

Ne pas maintenir un pronostic en attente uniquement parce qu’une première page officielle n’affiche pas encore le résultat. Consulter au moins une autre source fiable lorsque l’événement devait être terminé depuis plus de deux heures.

Si le résultat reste réellement ambigu, laisser uniquement ce pronostic en attente et continuer le traitement des autres.

Ajouter chaque règlement dans un nouveau fichier sous `src/content/settlements/`.

## 2. Déterminer la fenêtre temporelle

Utiliser l’heure réelle de l’exécution dans le fuseau `Europe/Paris`.

Rechercher des événements :

- commençant entre 30 minutes et 8 heures après l’exécution ;
- non commencés ;
- non proposés en direct ;
- avec un marché simple `h2h` à deux ou trois issues ;
- avec des cotes clairement attribuées à Betclic France.

Tous les sports et pays sont autorisés lorsqu’ils respectent les types et validations du dépôt.

### Vérification obligatoire de l’horaire

Ne jamais utiliser Wincomparator, un comparateur de cotes, un extrait de moteur de recherche ou une page de pronostics comme source principale de l’heure de début.

Les comparateurs servent à relever les cotes, pas à certifier les horaires.

Pour chaque événement candidat :

1. rechercher l’heure de début auprès d’une source officielle ;
2. privilégier le site de l’organisateur, de la fédération, de la compétition, du tournoi ou du club ;
3. identifier le fuseau horaire utilisé par la source ;
4. convertir cette heure en `Europe/Paris` ;
5. vérifier que l’événement commence réellement entre 30 minutes et 8 heures après l’exécution.

Pour les principales compétitions :

- utiliser l’UEFA pour ses compétitions ;
- utiliser la CONMEBOL pour ses compétitions ;
- utiliser l’ATP, la WTA ou le site officiel du tournoi pour le tennis ;
- utiliser le site officiel de la ligue ou de l’organisateur pour les autres sports.

Lorsqu’une source officielle affiche une heure locale sans préciser le fuseau, déterminer le fuseau du lieu de l’événement et confirmer l’horaire avec une seconde source fiable.

En cas de conflit entre un comparateur et une source officielle, conserver l’heure officielle.

Une heure imprécise ou incohérente ne doit pas entraîner un rejet immédiat. Chercher une autre source fiable avant de conclure.

Pour chaque candidat retenu dans la fenêtre, enregistrer :

- l’heure annoncée par la source officielle ;
- le fuseau horaire d’origine ;
- l’heure convertie en `Europe/Paris` ;
- l’URL exacte de la source officielle.

## 3. Relever les cotes Betclic

Ne pas se limiter à l’ouverture directe de `betclic.fr`.

Les cotes peuvent être relevées :

- sur une page publique de Betclic ;
- sur une page publique de comparaison de cotes ;
- sur une autre page publique attribuant clairement les cotes à Betclic France.

Toutes les issues doivent provenir de la même ligne Betclic. Ne jamais mélanger les meilleures cotes de plusieurs bookmakers.

### Procédure prioritaire

Pour chaque événement dont l’horaire officiel est dans la fenêtre autorisée :

1. rechercher sa page détaillée sur Wincomparator avec les noms exacts des participants ;
2. ouvrir la page consacrée précisément à l’événement ;
3. rechercher le tableau présentant les bookmakers ligne par ligne ;
4. rechercher la ligne `Betclic` ou `Betclic France` ;
5. relever toutes les cotes de cette seule ligne.

Ne pas utiliser comme relevé Betclic :

- un extrait de moteur de recherche ;
- une page générale de compétition ;
- une liste de rencontres ;
- un bloc `Top paris` ;
- un tableau présentant uniquement les meilleures cotes de plusieurs bookmakers.

Sur la page détaillée, rechercher notamment :

- `Cotes résultat (1N2)` pour un marché à trois issues ;
- `Cotes vainqueur` pour un marché à deux issues ;
- toute section équivalente affichant une ligne par bookmaker.

Lorsqu’une ligne Betclic complète existe dans le tableau détaillé, ne pas rejeter l’événement parce qu’une autre partie de la page mélange les bookmakers.

Si la ligne Betclic est absente, incomplète ou inaccessible sur Wincomparator, consulter au moins deux autres sources publiques pertinentes pour le même événement.

Ne rejeter un événement pour absence de ligne Betclic complète qu’après cette recherche détaillée.

Examiner au moins cinq événements distincts dont l’horaire officiel se trouve dans la fenêtre autorisée, lorsque cinq événements ou plus sont disponibles.

Une page ou une cote inutilisable ne doit jamais arrêter toute l’exécution. Continuer avec les autres candidats.

Pour chaque ligne Betclic complète, enregistrer :

- l’URL exacte de la page de cotes ;
- l’heure du relevé en `Europe/Paris` ;
- les participants ;
- le sport et la compétition ;
- toutes les issues du marché ;
- toutes les cotes Betclic ;
- le nom de la section consultée.

## 4. Choisir au maximum un pronostic

Analyser uniquement les candidats qui possèdent :

- un horaire officiel vérifié dans la fenêtre autorisée ;
- une ligne Betclic complète provenant d’un même relevé.

Utiliser des informations sportives publiques et récentes :

- forme récente ;
- absences ;
- niveau des participants ;
- surface ou lieu ;
- calendrier et fatigue ;
- confrontations pertinentes ;
- contexte sportif ;
- autres facteurs utiles.

Ne jamais utiliser automatiquement comme probabilité finale la seule estimation d’un comparateur.

Pour chaque candidat sérieux :

- choisir l’issue envisagée ;
- estimer sa probabilité à partir des informations consultées ;
- calculer le seuil implicite avec `1 / cote` ;
- calculer l’espérance avec `probabilité × cote - 1` ;
- expliquer les facteurs favorables ;
- expliquer les principales incertitudes.

Ne retenir un candidat que si :

- sa probabilité estimée dépasse le seuil implicite ;
- son espérance est strictement positive ;
- l’avantage reste suffisamment crédible après prise en compte des incertitudes.

Publier au maximum le meilleur candidat défendable.

Aucun pronostic n’est obligatoire lorsqu’aucun candidat ne présente une espérance positive suffisamment crédible.

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

`betclic-public` signifie que les cotes Betclic ont été observées publiquement. La référence doit être la page exacte sur laquelle la ligne Betclic complète a été relevée.

Ajouter le pronostic dans un nouveau fichier sous `src/content/predictions/`.

## 5. Publier sur GitHub

Écrire les nouveaux pronostics et règlements directement sur la branche `master`.

- Ne créer aucune branche.
- Ne créer aucune pull request.
- Ne modifier aucun autre fichier.
- Regrouper les nouveaux fichiers dans un même commit lorsque cela est possible.
- Utiliser un message de commit commençant par `content:`.
- Relire chaque nouveau fichier directement depuis GitHub.
- Vérifier que seuls les nouveaux fichiers JSON attendus ont été ajoutés.

Ne jamais modifier ce fichier d’instructions pendant une exécution.

## Rapport final

Toujours indiquer :

- les règlements examinés et ajoutés ;
- les sources utilisées pour vérifier les résultats ;
- le nombre d’événements dont l’horaire officiel a été vérifié ;
- le nombre de pages détaillées de cotes examinées ;
- le pronostic publié ou la raison de l’absence de publication ;
- les fichiers créés ;
- le hash du commit GitHub ;
- les validations effectuées.

En cas d’absence de publication, détailler les trois meilleurs candidats examinés, ou tous les candidats s’il y en avait moins de trois.

Pour chaque candidat détaillé, indiquer :

- l’événement ;
- la source officielle de l’horaire ;
- l’heure et le fuseau d’origine ;
- l’heure convertie en `Europe/Paris` ;
- l’URL de la page détaillée de cotes ;
- la section consultée ;
- la présence ou l’absence d’une ligne Betclic complète ;
- les cotes Betclic lorsqu’elles existent ;
- l’issue envisagée ;
- la probabilité estimée ;
- le seuil implicite ;
- l’espérance estimée ;
- la raison exacte du rejet.

Ne jamais conclure qu’un événement est commencé ou hors fenêtre à partir de la seule heure affichée par un comparateur.

Ne jamais annoncer une publication tant que le nouveau fichier n’a pas été relu depuis `master`.
