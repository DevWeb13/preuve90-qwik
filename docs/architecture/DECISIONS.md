# Registre des décisions d’architecture actives

Ce fichier conserve uniquement les décisions encore applicables à l’application.

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

## ADR-010 — Publications Loto Foot statiques et validées

- **Statut :** accepted
- **Date :** 2026-07-22
- **Auteur :** propriétaire du projet

### Décision

Prendre en charge les formules Loto Foot 7, 8, 12 et 15. Enregistrer chaque publication dans un fichier JSON distinct sous `src/content/loto-foot/publications/` et chaque règlement officiel dans un fichier JSON distinct sous `src/content/loto-foot/results/`. Charger et valider explicitement ces fichiers au build.

### Conséquences

- aucun accès au système de fichiers n’est requis au runtime Vercel Edge ;
- les dossiers de publications et de résultats peuvent rester vides ;
- une publication invalide, dupliquée ou incohérente fait échouer la validation ;
- un résultat orphelin, dupliqué ou incohérent avec sa publication fait échouer la validation.

## ADR-011 — Une combinaison simple vaut 1 EUR virtuel

- **Statut :** accepted
- **Date :** 2026-07-22
- **Auteur :** propriétaire du projet

### Décision

Une combinaison contient exactement autant de choix `1`, `N` ou `2` que la grille contient de matchs et représente 100 centimes virtuels. Les nombres de matchs autorisés sont ceux de la formule officielle : LF7 de 6 à 7, LF8 de 7 à 8, LF12 de 9 à 12 et LF15 de 12 à 15.

### Conséquences

- la mise virtuelle totale est calculée depuis le nombre de combinaisons et n’est pas stockée ;
- aucun argent réel n’est joué et aucun gain n’est garanti ;
- les gains, retours, résultats nets et statistiques sont calculés depuis les publications et résultats.

## ADR-012 — Séparation entre développement et publication planifiée

- **Statut :** accepted
- **Date :** 2026-07-22
- **Auteur :** propriétaire du projet

### Décision

Codex travaille sur une branche dédiée. Seule la tâche planifiée décrite dans `docs/automations/preuve90.md` peut pousser directement sur `master`, uniquement pour ajouter un nouveau fichier JSON de publication ou de résultat conforme.

### Conséquences

- la tâche planifiée ne modifie jamais un contenu existant, le code, la configuration, la documentation ou les instructions ;
- les modifications fonctionnelles suivent le processus de branche dédié ;
- l’inventaire est synchronisé séparément par GitHub Actions.

## ADR-013 — Immutabilité des publications retenues comme preuve

- **Statut :** accepted
- **Date :** 2026-07-23
- **Auteur :** propriétaire du projet

### Décision

Une publication ajoutée sur `master` par la procédure planifiée devient une preuve horodatée : ses probabilités, combinaisons, dates et décisions ne sont pas améliorées rétroactivement. Les résultats officiels sont ajoutés dans des fichiers séparés.

Pendant la mise au point du projet, une donnée explicitement traitée comme contenu de préproduction peut être corrigée dans un commit traçable. Cette exception cesse dès que la publication est retenue comme preuve publique définitive.

### Conséquences

- la publication définitive conserve la décision prise avant clôture ;
- un règlement référence sa publication et ne recopie pas les calculs dérivables ;
- une correction admissible reste visible dans l’historique Git ;
- aucune correction ne peut servir à améliorer rétroactivement la performance d’une publication définitive.
