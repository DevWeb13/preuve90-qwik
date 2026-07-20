# Tâche planifiée — Publier un pronostic

## Statut

**Inactive tant que toutes les préconditions ne sont pas satisfaites.**

## Objectif

Rechercher les matchs éligibles, analyser les informations disponibles et publier au maximum un pronostic 1N2 pertinent pour la journée civile dans le fuseau `Europe/Paris`.

La bonne exécution peut être `no_action`. Ne jamais publier uniquement pour atteindre un quota quotidien.

## Préconditions obligatoires

Avant toute activation, vérifier que :

- le système de persistance immuable est implémenté et documenté ;
- le bookmaker français de référence est défini dans une ADR acceptée ;
- les compétitions et fenêtres temporelles autorisées sont définies ;
- l'intégration The Odds API est disponible côté serveur ;
- la consommation mensuelle est mesurée ;
- une opération authentifiée de préparation et de publication existe ;
- les validations empêchent les doublons et les publications tardives ;
- l'environnement de production expose les variables nécessaires sans les révéler à ChatGPT ;
- le moteur de calcul et le schéma de données sont testés.

Si une précondition manque, terminer avec `blocked` et ne rien publier.

## Instructions d'exécution

1. Lire `AGENTS.md`, `docs/automations/README.md` et ce fichier depuis la branche par défaut.
2. Relever le SHA Git correspondant aux instructions.
3. Obtenir l'état courant via l'interface serveur prévue pour l'automatisation.
4. Vérifier qu'aucun pronostic n'est déjà publié pour la journée `Europe/Paris`.
5. Vérifier le budget The Odds API avant tout appel externe.
6. Refuser l'appel si le suivi mensuel est absent, incohérent ou risque de dépasser le plafond de 500 crédits.
7. Récupérer les matchs et cotes éligibles avec le minimum d'appels groupés possible.
8. Ne conserver que :
   - le football ;
   - les matchs non commencés ;
   - le marché 1N2 en temps réglementaire ;
   - les compétitions explicitement autorisées ;
   - une cote réellement disponible chez le bookmaker de référence.
9. Analyser les candidats avec les sources autorisées par l'architecture. Ne jamais utiliser une rumeur ou une donnée non vérifiable comme fait certain.
10. Choisir zéro ou un pronostic. En cas d'incertitude forte, choisir zéro.
11. Produire une justification concise qui distingue clairement les faits observés de l'interprétation de l'IA.
12. Préparer la publication en mode validation ou `dry-run`.
13. Contrôler avant validation finale :
    - identifiant externe unique du match ;
    - équipes et compétition cohérentes ;
    - coup d'envoi futur ;
    - sélection strictement `1`, `N` ou `2` ;
    - cote numérique supérieure à 1 ;
    - bookmaker égal au bookmaker de référence ;
    - horodatage du relevé antérieur au coup d'envoi ;
    - mise virtuelle exactement égale à 5 EUR ;
    - absence de pronostic déjà publié ce jour-là ;
    - absence de doublon pour ce match.
14. Publier de manière atomique avec une clé d'idempotence stable.
15. Relire l'enregistrement créé et vérifier que la cote, le bookmaker et les timestamps correspondent exactement à la préparation validée.
16. Terminer avec un rapport structuré conforme à `docs/automations/README.md`.

## Budget API

- Plafond absolu : 500 crédits par mois.
- Cible opérationnelle : rester sous 450 crédits afin de conserver une marge de sécurité.
- Ne jamais multiplier les régions, marchés ou bookmakers sans nécessité documentée.
- Ne jamais répéter un appel identique dans la même exécution si une réponse valide est déjà disponible.
- Enregistrer le coût retourné par l'API lorsque cette information est disponible.

## Contenu publié

La publication doit enregistrer définitivement :

- identifiant interne ;
- identifiant externe du match ;
- compétition ;
- équipes ;
- coup d'envoi ;
- sélection ;
- cote observée ;
- bookmaker ;
- heure du relevé ;
- heure de publication ;
- mise virtuelle de 5 EUR ;
- justification ;
- version du schéma ;
- version Git des instructions ;
- identifiant de l'exécution.

## Interdictions

- Ne pas publier après le début du match.
- Ne pas remplacer une cote indisponible par une cote moyenne ou estimée.
- Ne pas changer de bookmaker pour sauver une sélection.
- Ne pas utiliser une cote relevée après la publication.
- Ne pas créer plus d'un pronostic pour la même journée.
- Ne pas présenter le pronostic comme un conseil financier ou une garantie de gain.
- Ne pas inclure de lien d'affiliation ou d'incitation à parier.
- Ne pas modifier un ancien pronostic.

## Résultats possibles

- `success` : un pronostic unique a été publié et relu avec succès ;
- `no_action` : aucun candidat suffisamment pertinent ou un pronostic existe déjà ;
- `blocked` : précondition, budget ou source indisponible ;
- `failed` : erreur technique sans publication partielle.