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

## ADR-010 — Publications Loto Foot 7 statiques et validées

- **Statut :** accepted
- **Date :** 2026-07-22
- **Auteur :** propriétaire du projet

### Décision

Enregistrer chaque publication dans un fichier JSON distinct sous `src/content/loto-foot/publications/`. Enregistrer chaque règlement officiel dans un autre fichier JSON sous `src/content/loto-foot/results/`. Charger ces fichiers avec `import.meta.glob` en mode eager et valider explicitement leur structure au chargement.

### Conséquences

- aucun accès au système de fichiers n’est requis au runtime Vercel Edge ;
- le dossier de publications fonctionne lorsqu’il est vide ;
- une publication invalide ou un identifiant de publication dupliqué fait échouer la validation ;
- les publications sont triées par date de publication décroissante et accessibles par identifiant.
- un résultat orphelin, dupliqué ou incohérent avec sa publication fait échouer la validation.

## ADR-011 — Une combinaison simple vaut 1 EUR virtuel

- **Statut :** accepted
- **Date :** 2026-07-22
- **Auteur :** propriétaire du projet

### Décision

Une publication contient exactement six ou sept matchs et au moins une combinaison distincte ayant le même nombre de choix `1`, `N` ou `2`. Chaque combinaison représente 100 centimes virtuels, sans nombre maximal défini.

### Conséquences

- la mise virtuelle totale est calculée depuis le nombre de combinaisons et n’est pas stockée ;
- aucun argent réel n’est joué et aucun gain n’est garanti ;
- les gains par combinaison, retours, résultats nets et statistiques cumulées sont calculés depuis les publications et résultats, jamais stockés comme totaux manuels.

## ADR-012 — Séparation entre développement et publication planifiée

- **Statut :** accepted
- **Date :** 2026-07-22
- **Auteur :** propriétaire du projet

### Décision

Codex travaille toujours sur une branche dédiée. Seule la tâche planifiée décrite dans `docs/automations/preuve90.md` peut pousser directement sur `master`, uniquement pour ajouter un nouveau fichier JSON de publication ou de résultat conforme.

### Conséquences

- la tâche planifiée ne modifie jamais un contenu existant, le code, la configuration, la documentation ou les instructions ;
- les modifications fonctionnelles continuent à suivre le processus de branche dédié ;
- chaque ajout automatisé utilise le préfixe `content:` prévu pour son type et fait l’objet d’une relecture depuis `master` après le commit.

## ADR-013 — Immutabilité des pronostics et ajout séparé des résultats

- **Statut :** accepted
- **Date :** 2026-07-23
- **Auteur :** propriétaire du projet

### Décision

Les probabilités, combinaisons, dates de publication, mises et décisions prises avant la clôture ne sont jamais réécrites rétroactivement. Les résultats officiels sont ajoutés dans des fichiers séparés. Une erreur factuelle ou rédactionnelle peut être corrigée dans un commit traçable si elle ne modifie ni le sens du pronostic ni sa performance. Une correction ne doit jamais servir à améliorer rétroactivement une prédiction.

### Conséquences

- la publication d’origine reste la preuve horodatée de la décision prise avant clôture ;
- un règlement référence sa publication et ne recopie pas les calculs dérivables par ticket ;
- toute correction admissible d’un contenu existant doit rester visible dans l’historique Git.
