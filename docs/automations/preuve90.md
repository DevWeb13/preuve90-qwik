# Tâche planifiée Preuve90

## Rôle et limites

Cette instruction est l’unique procédure de la tâche planifiée ChatGPT, créée et configurée manuellement hors du dépôt. La tâche mesure une recherche de valeur estimée ; elle ne place aucun pari réel, ne promet aucun gain et ne force jamais une publication.

À chaque exécution, traiter dans cet ordre les règlements en attente puis, seulement ensuite, la recherche d’un éventuel nouveau pronostic. Une exécution peut ajouter plusieurs règlements certains, mais au maximum un pronostic.

## Préconditions

1. Accéder à la branche `master` et charger tous les fichiers existants de `src/content/predictions/*.json` et `src/content/settlements/*.json`.
2. Vérifier leur cohérence avec les types et validations du dépôt avant toute écriture.
3. Construire les ensembles des identifiants de pronostics, identifiants d’événements et pronostics déjà réglés afin d’empêcher tout doublon.
4. Utiliser uniquement des pages publiques actuelles et accessibles. Ne jamais contourner une authentification, une restriction d’accès ou une mesure technique.
5. S’arrêter sans écriture pour toute donnée, cote, date, issue, identité d’événement ou règle de marché ambiguë. Ne jamais inventer ni compléter une donnée manquante.

## 1. Régler d’abord les pronostics terminés

Pour chaque pronostic sans règlement dont l’événement est terminé :

1. Consulter la page publique Betclic France correspondante ou une source officielle publique faisant autorité.
2. Vérifier que `eventId`, les participants, la compétition et la date identifient sans ambiguïté le même événement.
3. Vérifier la règle du marché `h2h`, notamment en cas de prolongation, tirs au but, abandon, forfait, report ou interruption.
4. Ajouter un règlement uniquement si l’issue est certaine :
   - `WON` si l’issue gagnante correspond exactement à la sélection ;
   - `LOST` si l’issue gagnante est certaine et différente ;
   - `VOID` uniquement si l’annulation du marché est certaine.
5. Utiliser une provenance contenant `provider: "betclic-public"` ou `provider: "official-source"`, l’`eventId` publié et une `reference` publique précise.
6. Laisser le pronostic en attente si le résultat ou son application au marché n’est pas certain.

Chaque règlement est un nouveau fichier JSON dans `src/content/settlements/`. Ne modifier, supprimer, renommer ou remplacer aucun fait existant.

## 2. Consulter Betclic France et analyser les cotes

Après les règlements :

1. Consulter directement les pages publiques actuelles de Betclic France pour les événements à venir, tous sports et pays confondus parmi les pages effectivement accessibles.
2. Exclure le direct et tout événement commençant à moins de 30 minutes ou à plus de 8 heures de l’observation.
3. Conserver uniquement Betclic (FR), clé `betclic_fr`, et le marché simple principal `h2h` comportant exactement deux ou trois issues distinctes.
4. Recopier exactement les participants, les noms des issues, les cotes décimales, l’heure de début et l’heure d’observation. Ne jamais convertir les issues en catégories génériques.
5. Exclure un événement dont l’identifiant a déjà été publié, dont les données sont incomplètes, ou dont la page publique ne fournit pas une référence traçable.
6. Estimer pour chaque candidat défendable une probabilité en points de base entre 1 et 9 999, documenter les facteurs et l’incertitude, puis calculer l’espérance estimée `probabilité × cote − 1`.
7. Comparer honnêtement les candidats analysés. Les estimations de l’IA peuvent être fausses et ne constituent jamais une garantie.

## 3. Publier au maximum un pronostic

Publier zéro ou un nouveau pronostic : le meilleur candidat défendable parmi les prochains événements effectivement analysés. Zéro publication est un résultat normal.

Le pronostic doit notamment respecter :

- `bookmaker.observedAt <= publishedAt < startsAt` ;
- une mise virtuelle fixe de 500 centimes ;
- une sélection correspondant exactement à une issue et une cote enregistrée identique à celle de cette issue ;
- une espérance estimée strictement positive ;
- une provenance `{ provider: "betclic-public", eventId, reference }`, où `reference` désigne la page publique Betclic consultée ;
- l’unicité de l’identifiant interne et de l’événement.

Ajouter le pronostic dans un nouveau fichier JSON de `src/content/predictions/`. Ne modifier, supprimer, renommer, antidater ou réécrire aucun fait existant.

## 4. Valider et proposer la modification

1. Vérifier que seuls de nouveaux fichiers JSON de pronostics ou règlements ont été ajoutés.
2. Exécuter les validations de contenu et les tests ciblés applicables. Si une validation échoue, corriger uniquement le nouveau fichier ou abandonner l’écriture ; ne jamais modifier un fait existant.
3. Produire une trace concise : règlements examinés et ajoutés, pages Betclic consultées, nombre de candidats analysés, décision de publication ou d’abstention, validations exécutées et ambiguïtés rencontrées.
4. Si les permissions GitHub le permettent, créer une branche dédiée, y committer les seuls nouveaux JSON et proposer une pull request vers `master`.
5. Si les permissions ne permettent pas la branche, le commit ou la pull request, signaler précisément le blocage sans supposer l’accès disponible.

Ne jamais pousser directement sur `master`, activer une fusion automatique ou fusionner la pull request. La revue et la fusion restent humaines.
