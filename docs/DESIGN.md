# Preuve90 — Identité visuelle actuelle

Ce document décrit l’interface temporaire affichée pendant la conception de la nouvelle expérience. Il ne définit aucun futur fonctionnement produit.

## Principes

- conserver l’identité sombre et technique de Preuve90 ;
- afficher un message unique, clair et sans donnée fictive ;
- préserver une lecture immédiate sur mobile comme sur grand écran ;
- rendre tout le contenu essentiel côté serveur ;
- limiter le mouvement à une courte introduction non bloquante.

## Identité

Le logo, le favicon, le nom `Preuve90`, le cyan et le magenta restent les repères principaux. La palette exécutable vit dans `src/styles/tokens.css`. Les surfaces utilisent des fonds bleu nuit, des bordures cyan discrètes et des ombres diffuses.

La typographie repose sur la pile système. Les labels techniques emploient une pile monospace. Aucune police distante n’est chargée.

## Structure

- le header contient la marque et les trois routes publiques ;
- la page d’accueil présente l’annonce et un état « En préparation » ;
- les pages légales utilisent des panneaux et une mise en page éditoriale sobre ;
- le footer rappelle l’état temporaire du service ;
- la page 404 renvoie vers l’accueil.

Sur mobile, la navigation principale est fixée en bas de l’écran et respecte la zone sûre du système. À partir de 768 px, elle rejoint le header.

## Mouvement et accessibilité

GSAP anime uniquement l’arrivée du titre, du panneau et du trait lumineux. L’animation est désactivée avec `prefers-reduced-motion: reduce`.

L’interface conserve un lien d’évitement, un focus visible, une hiérarchie de titres continue, des zones tactiles d’au moins 44 px et un contraste renforcé. Aucun contenu ne dépend de la couleur ou du mouvement pour être compris.

## Critères de validation

- aucune donnée de démonstration n’est visible ;
- le message de préparation est compris sans interaction ;
- aucune route supprimée ne reste dans la navigation ;
- aucune largeur entre 320 px et 1440 px ne produit de débordement horizontal ;
- la navigation mobile ne masque pas le contenu ;
- les pages restent utilisables sans JavaScript et à 200 % de zoom.
