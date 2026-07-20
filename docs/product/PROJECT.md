# Preuve90 — Contrat produit

## Résumé

Preuve90 publie une expérience publique sur la capacité d’une IA à rechercher une valeur estimée positive parmi les prochains événements sportifs analysés. Le nom Preuve90 est conservé.

Chaque publication précède le début de l’événement, porte sur une issue Betclic (FR) exacte du marché principal `h2h` et simule une mise fixe de 5 EUR. Aucun argent réel n’est engagé et aucune interaction avec un bookmaker n’a lieu.

## Positionnement

Le produit est une expérience mesurable et auditable, jamais une méthode pour gagner de l’argent. La formulation correcte est « meilleur candidat parmi les prochains événements analysés ». Preuve90 ne prétend ni analyser tout Betclic, ni trouver un pari sûr, ni battre le bookmaker.

Une valeur estimée positive signifie que la probabilité évaluée par l’IA dépasse le seuil nécessaire pour rentabiliser la cote. Cette estimation peut être erronée. L’espérance estimée ne doit jamais être présentée comme un bénéfice réalisé ou garanti.

## Périmètre

- Tous sports et tous pays effectivement retournés par The Odds API `upcoming`.
- Betclic (FR), clé `betclic_fr`, exclusivement.
- Paris simples, marché principal `h2h`, exactement deux ou trois issues.
- Noms d’issues conservés exactement ; aucune conversion en `HOME`, `DRAW` ou `AWAY`.
- Événements commençant entre 30 minutes et 8 heures après l’observation, bornes incluses.
- Zéro ou un pronostic par scan ; aucun plafond journalier.
- Mise virtuelle fixe de 500 centimes.
- Aucun live, combiné, handicap, total, score exact ou pari joueur.
- Aucun compte, dépôt, affiliation, lien bookmaker ou argent réel.
- Aucune promesse de gain ou de rentabilité.

The Odds API indique que `upcoming` contient les événements en direct et les 8 prochains événements tous sports confondus. Preuve90 exclut le direct localement et choisit donc uniquement parmi ce sous-ensemble limité.

## Candidature au scan

La configuration unique fixe : bookmaker `betclic_fr`, marché `h2h`, mise 500 centimes, avance minimale 30 minutes, avance maximale 8 heures et maximum publié par scan 1.

Un événement est candidat uniquement si :

```text
observedAt + 30 minutes <= startsAt
startsAt <= observedAt + 8 heures
```

Sont exclus les événements commencés, trop proches ou trop lointains, sans Betclic, avec un autre marché, un marché incomplet, moins de deux ou plus de trois issues, des noms dupliqués, une cote invalide ou un résultat qui ne pourra pas être raisonnablement identifié.

## Publication immuable

Chaque pronostic conserve définitivement : identifiant, date et heure de publication, heure de début, sport, participants, identifiant externe, marché et issues exactes, sélection exacte, cote, bookmaker et observation, mise virtuelle, probabilité estimée en points de base, justification, facteurs, incertitude et source.

La sélection doit correspondre exactement à une issue et `recordedOdds` à sa cote. La probabilité estimée est comprise entre 1 et 9 999 points de base et doit produire une espérance strictement positive :

```text
espérance estimée = probabilité estimée × cote − 1
```

Cette valeur n’est pas stockée : elle est recalculée de manière déterministe pour éviter les incohérences.

## Règlements génériques

Le règlement est un fait distinct comportant `WON`, `LOST` ou `VOID`, une issue gagnante éventuellement nulle, des scores génériques facultatifs et une source The Odds API ou officielle.

- `WON` exige que l’issue gagnante soit exactement la sélection.
- `LOST` exige une issue gagnante non nulle et différente de la sélection.
- `VOID` exige une issue gagnante nulle.
- Un résultat ambigu reste sans règlement.
- Prolongation, tirs au but, abandon, forfait et interruption exigent une vérification des règles du marché.
- Un score seul ne suffit pas lorsque sa portée réglementaire est incertaine.

## Calculs et statistiques

Pour une mise virtuelle de 500 centimes : gagné = mise × cote enregistrée, perdu = 0, annulé = restitution de la mise. Le résultat net vaut retours moins mises réglées, le ROI vaut résultat net divisé par mises réglées et le taux de réussite vaut gagnés divisé par gagnés plus perdus.

Les vues conservent le nombre de pronostics, chaque statut, mises, retours, résultat net, taux de réussite, ROI et historique cumulé. Elles peuvent ajouter la probabilité estimée moyenne et l’espérance estimée moyenne au moment de la publication, clairement séparées des résultats réalisés. Les divisions sans dénominateur produisent une valeur neutre, jamais `NaN` ou `Infinity`.

## Architecture des faits

La V1 n’a ni base de données ni route API d’administration. Publications et règlements sont des JSON distincts, immuables et versionnés dans Git, chargés au build avec `import.meta.glob`. Les fixtures TypeScript sont réservées au développement et ne remplacent jamais l’état vide de production.

Les futurs robots travaillent sur une branche dédiée, ajoutent uniquement un nouveau JSON, exécutent les validations et ne modifient jamais un fait existant. Les opérations sont idempotentes.

## Source et budget

Le pipeline GitHub Actions interroge The Odds API sans exposer la clé à l’application ou aux futures tâches ChatGPT. Le forfait absolu est de 500 crédits, avec arrêt opérationnel à 450 utilisés ou 50 restants.

Le plan futur, non activé, prévoit quatre scans de cotes par jour, au maximum un crédit par scan non vide, soit environ 120 crédits mensuels. Ce chiffre est une estimation et non une promesse de coût exact. Les résultats ne sont demandés que lorsqu’il existe des pronostics non réglés.

## Avertissements obligatoires

Le site indique qu’aucun pari réel n’est placé, que la mise de 5 EUR est virtuelle, que les cotes sont des observations horodatées, que les estimations de l’IA peuvent être fausses, que les performances passées ne garantissent rien et que les jeux d’argent comportent des risques financiers et d’addiction et sont interdits aux mineurs.
