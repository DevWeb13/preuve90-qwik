# Registre des décisions d’architecture actives

Ce fichier conserve uniquement les décisions encore applicables à l’application nettoyée. Toute nouvelle règle produit durable devra faire l’objet d’une décision séparée.

## ADR-001 — Qwik et Qwik City

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Décision

Utiliser Qwik avec Qwik City et TypeScript strict pour fournir une application web rendue côté serveur.

### Conséquences

- les composants et routes suivent les primitives Qwik ;
- les dépendances doivent être compatibles avec la résumabilité et la cible de rendu ;
- le contenu essentiel doit rester disponible dans le HTML initial.

## ADR-002 — Déploiement Vercel Edge

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Décision

Conserver l’adaptateur Vercel Edge comme cible initiale de déploiement.

### Conséquences

- le code serveur doit être compatible avec l’Edge Runtime ;
- les secrets sont fournis par l’environnement et ne sont jamais exposés au client ;
- l’introduction d’une API Node indisponible à l’edge exige une nouvelle décision.

## ADR-005 — Aucun modèle Codex figé dans le dépôt

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** configuration initiale

### Décision

Ne pas définir de modèle dans `.codex/config.toml` et laisser le client choisir un modèle disponible.

### Conséquences

- la configuration ne dépend pas d’un nom de modèle amené à évoluer ;
- les tâches critiques reposent sur des validations vérifiables.

## ADR-009 — Identité sombre et mouvement progressif

- **Statut :** accepted
- **Date :** 2026-07-20
- **Auteur :** propriétaire du projet

### Décision

Conserver l’identité sombre Preuve90 décrite dans `docs/DESIGN.md`. Réserver GSAP aux animations courtes chargées côté client et utiliser CSS pour les interactions simples.

### Conséquences

- aucun contenu essentiel ne dépend de l’animation ;
- le mouvement réduit est respecté ;
- aucune bibliothèque visuelle supplémentaire n’est nécessaire pour l’interface temporaire.

## Décisions ouvertes

Le futur domaine fonctionnel, ses données, ses règles, ses sources et ses automatisations ne sont pas définis dans cette version et devront être conçus dans une mission séparée.
