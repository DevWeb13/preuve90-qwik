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

## Décisions ouvertes avant l'implémentation métier

Les points suivants nécessitent une ADR dédiée avant leur implémentation :

1. système de persistance et stratégie append-only ;
2. bookmaker français de référence ;
3. compétitions et fenêtres temporelles analysées ;
4. source et format des informations complémentaires utilisées par l'IA ;
5. mécanisme d'appel sécurisé entre les tâches ChatGPT et l'application ;
6. méthode exacte de comptage des crédits The Odds API ;
7. politique de correction en cas d'erreur factuelle publiée ;
8. stratégie de tests unitaires, intégration et navigateur ;
9. formulation juridique et dispositif de prévention des risques liés aux jeux d'argent.
