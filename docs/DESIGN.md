# Preuve90 — Cyber Football Lab

Ce document est la référence visuelle de la V1. L’interface doit évoquer un laboratoire de données football et une borne d’arcade futuriste, sans reprendre les codes transactionnels d’un bookmaker ou d’un casino réel.

## Vision

Le pronostic publié est une preuve, pas un produit à acheter. L’écran met donc d’abord en scène le match, la sélection immuable et son état, puis les chiffres observés et la méthode. Le décor cyberpunk reste un système de repères : grille, numéros, traits lumineux et surfaces techniques.

Principes directeurs :

- preuve avant performance ;
- lisibilité avant spectacle ;
- une hiérarchie forte, peu d’accents néon ;
- faits et limites visibles au même niveau que les résultats ;
- contenu complet dans le HTML, même sans JavaScript ni animation.

## Palette

Les valeurs exécutables vivent dans `src/styles/tokens.css`.

| Rôle          | Valeur de référence | Usage                           |
| ------------- | ------------------- | ------------------------------- |
| Fond profond  | `#050711`           | arrière-plan général            |
| Fond          | `#080c18`           | dégradés et navigation          |
| Surface       | `#0e1526`           | cartes principales              |
| Surface haute | `#131d33`           | panneaux secondaires            |
| Texte         | `#f5f7ff`           | titres et texte courant         |
| Texte atténué | `#9aa8c4`           | explications secondaires        |
| Cyan          | `#2ee8ff`           | identité, focus et liens        |
| Magenta       | `#ff3dc8`           | accent rare et repère graphique |
| Lime          | `#a8ff60`           | résultat gagné                  |
| Ambre         | `#ffc857`           | résultat en attente             |
| Corail        | `#ff6370`           | résultat perdu et erreurs       |
| Bleu neutre   | `#7ba7ff`           | résultat annulé                 |

Les longs paragraphes utilisent le texte clair ou atténué. La couleur ne constitue jamais le seul indicateur d’un état.

## Typographie

- Texte : `Inter`, puis la pile système sans-serif.
- Données : `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace.
- Titres : graisse 700 à 850, interlettrage légèrement négatif.
- Labels : capitales monospace, taille réduite et interlettrage positif.
- Cotes, scores et grands indicateurs : chiffres tabulaires.

Aucune police distante n’est chargée. L’identité vient de la composition et non d’une fonte décorative.

## Espacements, rayons et ombres

L’échelle d’espacement suit une base de 4 px : `4, 8, 12, 16, 24, 32, 48, 64, 96`. Les sections respirent davantage que les composants internes.

- petits contrôles : rayon 8 px ;
- cartes : rayon 16 px ;
- grand panneau principal : rayon 24 px ;
- capsules : rayon maximal ;
- ombres : diffuses, sombres, complétées par un halo cyan très faible ;
- angles coupés : réservés aux panneaux de preuve et aux accents, jamais aux textes longs.

## Grille responsive

Le contenu est mobile-first et limité à 1200 px.

- moins de 768 px : une colonne, statistiques sur deux colonnes lorsque la largeur le permet, navigation fixe en bas ;
- 768 à 1023 px : grille de 12 colonnes souple, navigation dans le header ;
- 1024 px et plus : panneau principal sur 7 à 8 colonnes, données complémentaires sur 4 à 5 colonnes.

Le contenu mobile reçoit un espace inférieur incluant `env(safe-area-inset-bottom)` pour ne jamais être masqué par la navigation.

## Navigation

Le header porte le logo `PREUVE90`, la signature `AI MATCH LAB` et quatre liens : Accueil, Historique, Statistiques, Méthode. Sous 768 px, ces liens deviennent une barre inférieure à quatre zones tactiles d’au moins 44 px. Une capsule ou ligne cyan indique la route active avec `aria-current="page"`.

Un lien d’évitement « Aller au contenu » apparaît au focus. Les pages légales restent dans le pied de page.

## Anatomie des pages

- Accueil : publications du jour en grille lisible, indicateurs essentiels, derniers faits, transparence.
- Historique : en-tête, compteur, filtres d’état et cartes regroupées par journée civile.
- Preuve : identité immuable, match, cote et mise, raisonnement, règlement, chronologie.
- Statistiques : indicateurs, répartition, courbe cumulative SVG, formules et taille d’échantillon.
- Méthode : protocole séquentiel, limites et budget de source.
- Pages légales : texte éditorial sobre, champs d’éditeur explicitement à compléter.
- 404 : message utile, repère technique et retour vers l’accueil.

## Composants

Les composants génériques (`Card`, `Panel`, `Badge`, `ButtonLink`, en-têtes et états) partagent les mêmes tokens. Les composants métier n’abritent aucun calcul financier : ils reçoivent des vues déjà dérivées.

`PredictionReel` reprend seulement le rythme visuel d’un rouleau `1 / N / 2`. Il n’est ni cliquable ni associé à une action de pari. `DailyPredictions` présente les preuves du jour sans empiler de grands panneaux ni imposer de carrousel. Les graphiques restent en SVG natif et proposent toujours un résumé textuel.

## Animations

CSS couvre focus, hover, navigation active et transitions simples. GSAP est chargé dynamiquement uniquement pour :

1. l’introduction du tableau de bord, sous 900 ms ;
2. l’arrêt bref du rouleau sur la sélection publiée ;
3. la montée visuelle des compteurs ;
4. le signal discret des états réglés.

Les animations ciblent principalement `transform` et `opacity`, jouent une seule fois et sont nettoyées au démontage. Avec `prefers-reduced-motion: reduce`, le résultat final apparaît immédiatement et tous les balayages sont supprimés.

## Accessibilité

- un `h1` par page et une hiérarchie de titres continue ;
- contraste texte/fond renforcé ;
- focus cyan visible et non masqué ;
- navigation complète au clavier ;
- zones tactiles d’au moins 44 px ;
- libellés écrits en plus des couleurs et icônes ;
- icônes décoratives avec `aria-hidden="true"` ;
- valeur finale des compteurs disponible aux technologies d’assistance ;
- graphiques titrés, décrits et résumés en texte ;
- aucun clignotement rapide ni information transmise uniquement par le mouvement.

## États de chargement, vide et erreur

Les données locales sont rendues immédiatement côté serveur : aucun spinner permanent. Un état vide explique l’absence de publication sans en inventer. Une erreur de validation ou de chargement affiche un panneau explicite et n’expose pas le contenu invalide. Le mode développement montre un bandeau persistant indiquant que les données sont fictives. Les routes inconnues utilisent une 404 cohérente.

## Éléments interdits

- bouton « Parier », dépôt, portefeuille, bonus ou appel commercial ;
- lien bookmaker ou affiliation ;
- promesse de gain ;
- compteur de jackpot ou mise modifiable ;
- thème clair, glassmorphism lourd, vidéo, canvas, WebGL ou son automatique ;
- animation en boucle ou longue séquence au défilement ;
- fausse donnée pour remplir un état de production.

## Critères de validation visuelle

- les publications du jour et leurs statuts se comprennent en moins de cinq secondes ;
- la preuve, la cote observée, Betclic (FR) et la mise virtuelle sont visibles sans ambiguïté ;
- aucun écran ne ressemble à un tunnel de pari ;
- aucune largeur entre 320 px et 1440 px ne produit de débordement horizontal ;
- la navigation inférieure ne masque aucun contenu ;
- les écrans restent lisibles à 200 % de zoom ;
- le mode mouvement réduit conserve toutes les informations ;
- l’état vide de production et le bandeau de démonstration sont immédiatement distinguables.
