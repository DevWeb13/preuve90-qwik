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

- **Statut :** accepted
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

- **Statut :** accepted
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
- La pertinence, les compétitions autorisées, les matchs disponibles et le budget absolu de 500 crédits The Odds API empêchent une publication massive sans intérêt.
- Une exécution peut toujours conclure qu’aucun candidat n’est pertinent.
- Les appels API groupés et économiques sont privilégiés, même lorsque plusieurs matchs sont analysés.
- La CI refuse la modification, la suppression ou le renommage d’un JSON déjà présent sur la branche de base.

---

## ADR-012 — Collecte The Odds API via GitHub Actions

- **Statut :** accepted
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

## Décisions ouvertes avant l'activation des automatisations

Les points suivants nécessitent une ADR dédiée avant leur implémentation :

1. fenêtre temporelle exacte analysée par la future tâche de publication ;
2. source et format des informations complémentaires utilisées par l’IA ;
3. procédure Git et droits exacts des futurs robots ChatGPT ;
4. politique de correction en cas d’erreur factuelle publiée ;
5. règles des matchs reportés, abandonnés ou interrompus ;
6. formulation juridique et dispositif de prévention des risques liés aux jeux d’argent.
