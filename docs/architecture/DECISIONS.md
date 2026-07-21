# Registre des décisions d'architecture

Ce fichier consigne les décisions structurantes de Preuve90. Une décision acceptée ne doit pas être modifiée silencieusement : ajouter une nouvelle entrée qui la remplace.

## Format

Chaque décision contient :

- statut : `proposed`, `accepted`, `superseded` ou `rejected` ;
- contexte ;
- décision ;
- conséquences ;
- date et auteur.

---

## ADR-001 — Qwik et Qwik City

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

Le projet doit fournir une application web rapide, rendue côté serveur et adaptée à Vercel.

### Décision

Utiliser Qwik avec Qwik City et TypeScript strict.

### Conséquences

- Les composants et routes suivent les primitives Qwik.
- Les habitudes React non adaptées à la résumabilité doivent être évitées.
- Les nouvelles dépendances doivent être compatibles avec le runtime et le rendu choisis.

---

## ADR-002 — Déploiement Vercel Edge

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

Le starter Qwik contient déjà l'adaptateur Vercel Edge et génère la sortie Build Output API dans `.vercel/output`.

### Décision

Conserver Vercel Edge comme cible initiale de déploiement.

### Conséquences

- Les bibliothèques serveur doivent être compatibles avec l'Edge Runtime.
- Une dépendance nécessitant des API Node non disponibles à l'edge impose une nouvelle décision.
- Les secrets sont fournis par les variables d'environnement Vercel et ne sont jamais exposés au client.

---

## ADR-003 — Pronostic original immuable

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

La crédibilité du produit repose sur la preuve qu'un pronostic et sa cote existaient avant le match.

### Décision

Traiter la publication avant match comme un fait immuable. Le résultat, le règlement et les éventuelles corrections sont ajoutés séparément, sans réécrire la publication originale.

### Conséquences

- Le modèle de persistance doit être append-only ou fournir des garanties équivalentes.
- Une cote enregistrée ne peut jamais être mise à jour.
- Les interfaces d'administration ne doivent pas proposer de suppression ou d'édition destructive d'un pronostic publié.
- Les tâches automatiques doivent être idempotentes.

---

## ADR-004 — Automatisations pilotées par les tâches planifiées ChatGPT

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

Le propriétaire souhaite piloter la publication et le règlement avec la planification ChatGPT. Les consignes versionnées dans GitHub sont l'autorité opérationnelle.

### Décision

Chaque tâche planifiée doit lire `AGENTS.md` puis le fichier Markdown correspondant dans `docs/automations/` avant chaque exécution.

### Conséquences

- Les instructions d'automatisation sont versionnées et revues par pull request.
- Les tâches ne modifient jamais leurs propres consignes.
- Une tâche s'arrête sans écriture si une précondition n'est pas satisfaite.
- Les accès aux systèmes externes restent limités aux connecteurs et secrets explicitement autorisés.

---

## ADR-005 — Aucun modèle Codex figé dans le dépôt

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** configuration initiale

### Contexte

Les modèles Codex disponibles et recommandés évoluent. Le propriétaire utilise le meilleur modèle Codex disponible avec un niveau de raisonnement élevé.

### Décision

Ne pas définir de champ `model` dans `.codex/config.toml`. Définir uniquement un effort de raisonnement élevé et laisser le client ChatGPT/Codex choisir le modèle courant.

### Conséquences

- Le dépôt ne devient pas obsolète à chaque changement de nom de modèle.
- Le modèle peut être choisi par session dans VS Code, Codex local ou Codex cloud.
- Les tâches critiques doivent s'appuyer sur des tests et des invariants, pas sur un comportement supposé d'une version de modèle.

---

## ADR-006 — Faits JSON immuables versionnés dans Git

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

La V1 doit rester simple, auditable et compatible avec Vercel Edge sans base de données.

### Décision

Stocker les publications et règlements dans deux collections JSON distinctes versionnées dans Git. Les charger au build avec `import.meta.glob` en mode eager et dériver toutes les vues et statistiques de ces faits.

### Conséquences

- Aucun accès `fs` ni base de données au runtime.
- Une publication ou un règlement est ajouté par un futur robot via une branche et une revue humaine, jamais modifié en place.
- La contrainte d’unicité quotidienne initialement envisagée est remplacée par l’ADR-011.
- Le dépôt valide les schémas, les identifiants, les matchs et les associations avant exposition.
- Aucune route API d’administration n’existe en V1.

---

## ADR-007 — Betclic France comme bookmaker de référence

- **Statut :** superseded par ADR-013
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

Une référence française fixe est requise pour rendre les cotes comparables et empêcher un changement opportuniste de source.

### Décision

Utiliser exclusivement Betclic (FR), clé technique `betclic_fr`, pour les publications V1 sur le marché football 1N2 en temps réglementaire.

### Conséquences

- Une publication portant une autre clé ou un autre nom est invalide.
- La cote, la source et l’heure d’observation sont figées avant le coup d’envoi.
- L’affichage rappelle qu’une cote observée ne garantit pas son acceptation pour une personne donnée.

---

## ADR-008 — Démonstration strictement locale au développement

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

L’interface doit être testable avant la première publication réelle sans confondre fixtures et preuve publique.

### Décision

Utiliser des données TypeScript déterministes uniquement lorsque `import.meta.env.DEV` est vrai et qu’aucun JSON réel n’existe. En production, une collection vide reste vide.

### Conséquences

- Le mode démo porte un avertissement visible.
- Une vraie publication désactive entièrement les fixtures.
- Les pages de démo ne constituent pas des preuves indexables.

---

## ADR-009 — Cyber Football Lab et mouvement progressif

- **Statut :** superseded par ADR-013 pour l’identité football ; principes visuels conservés
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

La V1 a besoin d’une identité originale sans nuire à la crédibilité, à l’accessibilité ou au poids client.

### Décision

Adopter le thème sombre unique « Cyber Football Lab » décrit dans `docs/DESIGN.md`. Réserver GSAP aux animations signatures chargées côté client et utiliser CSS pour les micro-interactions.

### Conséquences

- Le contenu essentiel est rendu côté serveur avant toute animation.
- Le mouvement réduit désactive rouleau, compteurs et balayages.
- Aucune bibliothèque UI, de graphique ou d’animation supplémentaire n’est utilisée.

---

## ADR-010 — Tests métier avec Vitest

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

Les calculs en centimes et les règles d’intégrité doivent être vérifiables indépendamment de Qwik.

### Décision

Tester avec Vitest les fonctions pures de calcul, validation, assemblage et statistiques. Ajouter l’exécution non interactive à la CI.

### Conséquences

- Les tests ne ciblent pas les détails de rendu Qwik.
- `npm run check` inclut les tests unitaires.
- Une branche rouge ne doit pas être publiée.

---

## ADR-011 — Plusieurs publications autorisées par journée

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet
- **Remplace :** l’hypothèse d’unicité quotidienne mentionnée avant cette décision

### Contexte

La limite d’un pronostic quotidien ne reflète ni le nombre variable de matchs pertinents ni l’objectif de mesurer chaque analyse indépendamment. Elle écarterait artificiellement des candidats valides sans améliorer la traçabilité.

### Décision

Autoriser zéro, une ou plusieurs publications pour une même date civile `Europe/Paris`, sans plafond journalier codé en dur. L’unicité reste obligatoire pour l’identifiant interne et l’identifiant externe du match. Chaque publication et chaque règlement demeurent des faits distincts et individuellement immuables.

### Conséquences

- Les statistiques additionnent toutes les mises et tous les règlements individuels.
- La pertinence des événements analysés empêche une publication massive sans intérêt.
- Une exécution peut toujours conclure qu’aucun candidat n’est pertinent.
- La CI refuse la modification, la suppression ou le renommage d’un JSON déjà présent sur la branche de base.

---

## ADR-012 — Collecte The Odds API via GitHub Actions

- **Statut :** superseded par ADR-015
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Contexte

Les cotes Betclic France et les résultats doivent être collectés sans exposer la clé The Odds API à l’application ou aux futures tâches ChatGPT. Le forfait gratuit impose une limite mensuelle stricte de 500 crédits.

### Décision

Utiliser un workflow GitHub Actions manuel pour interroger The Odds API et publier des snapshots JSON nettoyés dans la branche technique mutable `automation-data`. GitHub Actions conserve seul le secret `THE_ODDS_API_KEY`. Les compétitions initiales sont la Ligue 1 (`soccer_france_ligue_one`), la Premier League (`soccer_epl`) et la Ligue des champions UEFA (`soccer_uefa_champs_league`). Les cotes sont limitées à Betclic (FR), au marché `h2h` et à la région française.

Les futures tâches ChatGPT ne reçoivent que les snapshots nettoyés. Le workflow reste manuel au lancement et ne publie aucun pronostic, règlement ou changement directement sur `master`.

### Conséquences

- Les derniers snapshots vivent dans `automation-data` et ne sont pas soumis à l’immutabilité des preuves publiques.
- Aucun secret, URL authentifiée ou payload brut n’est enregistré dans les snapshots.
- Le budget centralisé refuse de poursuivre à partir de 450 crédits utilisés ou de 50 crédits restants.
- Aucun cron, aucune base de données, aucune API applicative et aucun stockage supplémentaire ne sont introduits.
- L’activation des tâches ChatGPT reste soumise aux autres préconditions documentées.

---

## ADR-013 — Pivot vers la recherche multisport de valeur estimée

- **Statut :** superseded par ADR-015
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet
- **Remplace :** les restrictions football/1N2 des ADR-007, ADR-009 et ADR-012 ; le mécanisme GitHub Actions et les garanties d’immutabilité restent applicables

### Contexte

Le périmètre football limité à trois compétitions ne mesure pas la capacité de l’IA à rechercher une valeur estimée dans la couverture réellement disponible. The Odds API fournit un endpoint transversal `upcoming`, mais sa couverture reste volontairement réduite.

### Décision

Preuve90 devient une expérience tous sports et tous pays, limitée aux événements effectivement retournés par `GET /v4/sports/upcoming/odds`. La requête utilise uniquement Betclic France (`betclic_fr`), le marché principal `h2h`, les cotes décimales et les dates ISO. L’endpoint retourne les événements en direct et les 8 prochains événements tous sports confondus ; le direct est exclu localement.

Un candidat commence entre 30 minutes et 8 heures après l’observation, bornes incluses. Chaque scan publie zéro ou un pronostic, le meilleur candidat défendable du scan, sans plafond journalier. Les deux ou trois issues Betclic sont conservées sous leur nom exact et la sélection correspond exactement à l’une d’elles.

Chaque analyse publie une probabilité estimée en points de base et doit avoir une espérance estimée strictement positive, calculée par `probabilité × cote − 1`. Ces valeurs sont explicitement des estimations de l’IA, jamais une promesse de rentabilité.

La publication reste strictement antérieure au début de l’événement. Le règlement multisport ne dépend plus d’un score domicile/extérieur : il consigne une issue gagnante certaine, des scores génériques facultatifs et une source. Tout résultat ambigu, y compris lorsque les règles du marché après prolongation, abandon, forfait ou interruption sont incertaines, reste en attente.

### Conséquences

- Preuve90 ne prétend jamais analyser tout Betclic ni trouver un « meilleur pari absolu ».
- Les trois compétitions football fixes et l’appel préalable à `/sports` disparaissent du scan de cotes.
- Le snapshot de cotes et sa métadonnée passent au schéma version 2.
- Les résultats sont demandés uniquement pour les pronostics non réglés, regroupés par `sport.key`.
- Le design sombre, responsive et progressif est conservé sous la signature « AI Value Lab ».
- Les statistiques réalisées restent fondées sur la mise de 500 centimes et la cote immuable ; les moyennes estimées restent séparées.
- Aucune garantie de gain, de bénéfice ou de coût API exact n’est formulée.

---

## ADR-014 — Automatisation planifiée et provenance des scans

- **Statut :** superseded par ADR-015
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet
- **Remplace :** le déclenchement exclusivement manuel et l’absence de cron de l’ADR-012

### Contexte

Le scanner multisport et les snapshots version 2 sont prêts, mais une collecte uniquement manuelle ne permet pas aux tâches ChatGPT externes de travailler régulièrement. La publication doit aussi prouver exactement quel fichier de cotes a servi et empêcher qu’un scan génère plusieurs pronostics.

### Décision

Planifier quatre collectes de cotes par jour avec `0 0,6,12,18 * * *` et deux collectes de résultats par jour avec `45 6,18 * * *`. Ces expressions GitHub sont en UTC. `workflow_dispatch` conserve les choix `odds`, `results` et `all`, tandis que chaque événement `schedule` est résolu explicitement depuis son expression exacte : aucun cron ne sélectionne `all` et toute valeur inconnue échoue.

Les tâches ChatGPT de publication et de règlement sont créées manuellement hors du dépôt. Le plugin GitHub et ses permissions sont configurés manuellement par l’utilisateur ; leur disponibilité n’est jamais supposée. The Odds API reste exclusivement appelée depuis GitHub Actions et aucun secret n’est transmis à ChatGPT.

Un snapshot de cotes peut être utilisé pendant au maximum 150 minutes après son `generatedAt`. La tâche de publication revérifie toujours au moment de l’analyse `maintenant + 30 minutes <= startsAt <= observedAt + 8 heures`, même si le snapshot est frais.

Chaque pronostic recopie dans `source.snapshotGeneratedAt` la valeur exacte `generatedAt` de `snapshots/odds.json` et dans `source.snapshotSha` le blob SHA GitHub exact de ce fichier sur `automation-data`. Ce SHA n’est ni un SHA de commit, ni le SHA de `metadata.json`, ni un hash recalculé. Un blob SHA ne peut être associé qu’à un seul pronostic.

Lorsqu’elles disposent des droits GitHub nécessaires, les tâches créent une branche dédiée et une pull request vers `master`. Elles ne poussent jamais directement sur `master`, ne fusionnent jamais et n’activent pas l’auto-merge. Toute fusion reste humaine.

### Conséquences

- La collecte continue de pousser uniquement les snapshots nettoyés sur `automation-data` avec `contents: write` et sans créer de pull request.
- L’heure d’été ou d’hiver Europe/Paris n’altère pas les crons UTC ; la fraîcheur réelle protège l’analyse contre le décalage et les retards.
- La chronologie publique devient `snapshotGeneratedAt <= bookmaker.observedAt <= publishedAt < startsAt`.
- Plusieurs pronostics le même jour restent possibles uniquement depuis des événements et des blobs SHA distincts.
- Un snapshot ancien, déjà utilisé ou invalide produit `blocked` sans pronostic, branche ni pull request.
- L’absence d’accès ou de permission GitHub produit `blocked` sans supposer une configuration externe réussie.
- Le modèle `Settlement` ne reçoit pas cette provenance de scan.

---

## ADR-015 — Consultation publique directe de Betclic France

- **Statut :** accepted
- **Date :** 2026-07-21
- **Auteur :** propriétaire du projet
- **Remplace :** ADR-012, ADR-013 et ADR-014 ; le périmètre multisport et les invariants métier d’ADR-013 sont conservés

### Contexte

Le pipeline de collecte intermédiaire, sa branche technique et ses fichiers temporaires complexifient le dépôt alors que la tâche ChatGPT peut consulter directement les pages publiques actuelles de Betclic France.

### Décision

Supprimer le pipeline, sa planification, ses secrets, ses scripts et son stockage intermédiaire. Une unique tâche ChatGPT, configurée hors du dépôt et régie par `docs/automations/preuve90.md`, vérifie d’abord les résultats certains puis consulte les pages publiques Betclic France et peut publier au maximum un nouveau pronostic défendable.

Le périmètre reste multisport et limité aux événements Betclic France effectivement consultés, hors direct, commençant entre 30 minutes et 8 heures après l’observation. Seul le marché principal `h2h` à deux ou trois issues exactes est accepté.

La provenance d’un pronostic devient `{ provider: "betclic-public", eventId, reference }`. Celle d’un règlement utilise `betclic-public` ou `official-source`, avec `eventId` et une référence publique. La chronologie obligatoire reste `bookmaker.observedAt <= publishedAt < startsAt`.

### Conséquences

- Aucun workflow de collecte, stockage technique séparé, secret fournisseur ou dépendance de collecte n’est conservé.
- La tâche ajoute uniquement de nouveaux faits JSON sur une branche dédiée et propose une pull request vers `master` si ses permissions GitHub le permettent.
- Aucun fait n’est modifié, aucune publication n’est forcée, aucune fusion n’est automatique et aucun push direct sur `master` n’est autorisé.
- La suppression éventuelle de l’ancienne branche distante et de l’ancien secret GitHub reste une action manuelle après fusion.

---

## Décisions ouvertes avant l'activation des automatisations

Les points suivants nécessitent une ADR dédiée avant leur implémentation :

1. source et format des informations complémentaires utilisées par l’IA ;
2. politique de correction en cas d’erreur factuelle publiée ;
3. règles détaillées par sport et marché pour les événements reportés, abandonnés ou interrompus ;
4. formulation juridique et dispositif de prévention des risques liés aux jeux d’argent.
