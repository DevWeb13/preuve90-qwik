# Pipeline de données Betclic multisport

## Architecture

```text
The Odds API → GitHub Action manuelle → branche automation-data → snapshots JSON nettoyés
```

Le pipeline n’ajoute ni base de données, ni route API Qwik, ni endpoint d’administration. Le secret reste dans GitHub Actions. Les futures tâches ChatGPT, inactives, ne reçoivent que les snapshots nettoyés.

## Scan des cotes

La collecte utilise exactement :

```text
GET /v4/sports/upcoming/odds
bookmakers=betclic_fr
markets=h2h
oddsFormat=decimal
dateFormat=iso
```

Le paramètre `bookmakers` suffit : aucune région ni autre bookmaker n’est demandé. Aucun `commenceTimeFrom` ou `commenceTimeTo` n’est transmis avec la clé `upcoming`, et l’ancien appel préalable à `/sports` a été supprimé.

`upcoming` fournit les événements en direct et les 8 prochains événements tous sports confondus. Preuve90 ne prétend donc pas analyser tout Betclic. Le filtrage local exclut le direct et conserve uniquement :

```text
observedAt + 30 minutes <= startsAt
startsAt <= observedAt + 8 heures
```

Un événement doit avoir exactement une offre Betclic `h2h`, deux ou trois issues uniques et valides, ainsi que les deux participants identifiables. Les noms d’issues et les clés/titres de sport proviennent de l’API sans conversion `HOME`, `DRAW` ou `AWAY`. Le tri est `startsAt`, puis `eventId`.

## Résultats

Le mode résultats lit uniquement les pronostics multisports réels non réglés et déjà commencés. Il regroupe les identifiants par `sport.key`, n’appelle aucun endpoint si la liste est vide et demande seulement les événements utiles à `/v4/sports/{sportKey}/scores`.

Le snapshot conserve des scores génériques `{ name, value }` et un état technique `complete`, `incomplete` ou `ambiguous`. Il ne produit jamais `WON`, `LOST` ou `VOID` et n’invente pas d’issue gagnante. Une source officielle pourra compléter ultérieurement un sport non couvert ou un cas réglementaire incertain.

## Snapshots version 2

La branche technique mutable `automation-data` contient :

```text
snapshots/odds.json
snapshots/results.json
snapshots/metadata.json
```

`odds.json` contient `schemaVersion`, `generatedAt`, le bookmaker, la fenêtre et les événements normalisés avec sport, participants, début, observation et marché `h2h`. `results.json` contient les résultats techniques génériques. `metadata.json` contient le mode, `sourceMode`, la couverture limitée à 8 événements, la possibilité de live en amont, la fenêtre, les compteurs et le quota.

Les trois fichiers ont des timestamps UTC millisecondés, un schéma strict, un tri déterministe et aucun champ brut inutile. Aucun secret, URL API ou en-tête sensible n’est persisté. Une collecte partielle remplace uniquement le snapshot du mode demandé dans le workflow ; l’autre mode est préservé. Lors de la première initialisation, un snapshot vide valide est disponible.

## Budget API

La limite absolue est de 500 crédits par mois. Le garde-fou refuse un nouvel appel dès 450 crédits utilisés ou 50 crédits restants. Le client lit `x-requests-used`, `x-requests-remaining` et `x-requests-last`; une valeur absente reste `null` avec avertissement. Les requêtes identiques sont dédupliquées pendant une exécution.

Plan futur, documenté mais non activé :

```text
4 scans de cotes par jour
1 crédit maximum par scan non vide
environ 120 crédits par mois
```

Le coût réel dépend de la tarification et des réponses du fournisseur ; il n’est pas garanti. Les vérifications de résultats sont déclenchées uniquement lorsqu’il existe des pronostics non réglés et restent soumises au garde-fou global.

## Utilisation locale et GitHub

Le secret serveur est `THE_ODDS_API_KEY`. Ne jamais le préfixer par `PUBLIC_`, l’afficher ou le committer.

```bash
npm run odds:collect -- --output ./tmp/snapshots
npm run odds:results -- --output ./tmp/snapshots
npm run odds:pipeline -- --mode all --output ./tmp/snapshots
npm run odds:validate -- --output ./tmp/snapshots
```

Les tests utilisent uniquement des réponses simulées. Dans GitHub Actions, lancer manuellement « Collect Betclic data » avec `odds`, `results` ou `all`. Le workflow part de `master`, teste, collecte dans un dossier temporaire, valide, puis met à jour uniquement `automation-data`. Il ne crée aucune pull request, ne fusionne rien et ne pousse jamais sur `master`. Aucun cron n’est actif.
