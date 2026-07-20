# Pipeline de données football

## Architecture

Le pipeline serveur minimal suit ce flux :

```text
The Odds API → GitHub Action manuelle → branche automation-data → snapshots JSON nettoyés
```

Il n’ajoute ni base de données, ni route API Qwik, ni endpoint d’administration. Le secret reste dans GitHub Actions. Les futures tâches ChatGPT, actuellement inactives, ne recevront que les snapshots nettoyés.

## Périmètre

Les seules compétitions configurées sont :

- Ligue 1 : `soccer_france_ligue_one` ;
- Premier League : `soccer_epl` ;
- Ligue des champions UEFA : `soccer_uefa_champs_league`.

La collecte de cotes utilise uniquement le marché `h2h`, la région `fr`, le format décimal et le bookmaker `betclic_fr` — Betclic (FR). Un événement sans les trois issues domicile, nul et extérieur est exclu.

Les scores sont demandés uniquement pour les compétitions de pronostics réels non réglés. Un résultat incomplet ou ambigu reste explicitement non terminé et n’est jamais converti en `WON`, `LOST` ou `VOID`.

## Fichiers produits

La branche technique mutable `automation-data` contient les derniers fichiers :

```text
snapshots/odds.json
snapshots/results.json
snapshots/metadata.json
```

Les fichiers ont un schéma versionné, des timestamps UTC, un tri déterministe et uniquement les champs nécessaires. Les cotes sont des chaînes décimales. Aucun secret, URL d’appel ou en-tête sensible n’est persisté. Une collecte partielle conserve le dernier snapshot de l’autre mode ; lors de la première initialisation, un snapshot vide valide est créé.

## Budget API

La limite absolue est de 500 crédits par mois, avec une marge minimale de 50 et une cible opérationnelle inférieure à 450 crédits utilisés. Le client lit `x-requests-used`, `x-requests-remaining` et `x-requests-last`. Une valeur absente ou invalide reste `null` et produit un avertissement. Dès que la marge est atteinte, aucun nouvel appel n’est lancé. Les requêtes identiques sont dédupliquées pendant une exécution.

Chaque compétition coûte normalement un crédit pour les cotes (`h2h`, un bookmaker) et deux crédits pour les scores demandés avec `daysFrom=3`. Les appels de résultats utilisent `eventIds` et ne concernent que les compétitions utiles.

## Utilisation locale

Le secret serveur requis est `THE_ODDS_API_KEY`. Ne jamais le préfixer par `PUBLIC_`, l’afficher ou le committer.

```bash
npm run odds:collect -- --output ./tmp/snapshots
npm run odds:results -- --output ./tmp/snapshots
npm run odds:pipeline -- --mode all --output ./tmp/snapshots
npm run odds:validate -- --output ./tmp/snapshots
```

Les tests n’utilisent pas de vraie clé ni le réseau :

```bash
npm run test:run -- src/lib/odds-pipeline.test.ts
```

## Déclenchement GitHub

Dans l’onglet Actions, sélectionner « Collect football data », lancer « Run workflow » et choisir `odds`, `results` ou `all`. Le workflow part de `master`, teste le pipeline, collecte dans un dossier temporaire, valide les fichiers puis crée ou met à jour uniquement `automation-data`. Il ne crée aucune pull request et ne pousse jamais sur `master`.

Le secret GitHub `THE_ODDS_API_KEY` doit être configuré par le propriétaire. Le workflow ne le crée pas et ne l’affiche pas.

## Limites connues

- Le endpoint courant des scores remonte au maximum trois jours avec `daysFrom=3`.
- Une compétition hors saison peut retourner une liste vide.
- Betclic peut être temporairement absent ; l’événement est alors exclu.
- Les règles de règlement des matchs reportés, abandonnés ou interrompus restent hors de ce pipeline.
- Aucune collecte réelle n’est garantie sans secret GitHub valide.
- Aucun cron ni tâche ChatGPT/Codex n’est actif au lancement.

## Références officielles

- [Documentation API v4](https://the-odds-api.com/liveapi/guides/v4/) : endpoints, paramètres, coûts et en-têtes de quota.
- [Clés des sports](https://the-odds-api.com/sports-odds-data/sports-apis.html) : compétitions et prise en charge des scores.
- [Clés des bookmakers](https://the-odds-api.com/sports-odds-data/bookmaker-apis.html) : région `fr` et clé `betclic_fr`.
