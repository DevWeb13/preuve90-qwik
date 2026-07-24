# Preuve90 : Système d’interface produit

Ce document est la référence de l’expérience publique Preuve90. L’interface rend vérifiables des pronostics Loto Foot publiés avant leur clôture, puis comparés aux résultats et rapports officiels. Elle ne promet aucun gain et n’emploie que les données validées et les calculs du produit.

## 1. Hiérarchie de l’information

L’interface sépare toujours les résultats définitifs des montants encore en attente. Une grille non réglée n’est jamais présentée comme une perte.

L’ordre de la page d’accueil est :

1. promesse produit compacte ;
2. bilan des grilles terminées ;
3. mise totale encore en attente, dans un encart séparé ;
4. rendement et performances ;
5. accès aux quatre formules ;
6. grilles publiées ;
7. avertissement.

L’ordre d’une page de formule contenant des publications est :

1. fil d’Ariane compact ;
2. identité de la formule ;
3. navigation compacte sur tablette et ordinateur ;
4. bilan des grilles terminées de la formule ;
5. mise encore en attente ;
6. rendement et performances ;
7. grilles publiées ;
8. avertissement.

Une page de formule sans publication affiche uniquement son fil d’Ariane, son identité, la navigation adaptée à la largeur disponible et un état vide.

L’ordre d’une page de grille sans résultat officiel est :

1. fil d’Ariane compact ;
2. identité, statut, clôture et publication ;
3. temps restant avant la clôture ou écoulé depuis celle-ci ;
4. message synthétique sur l’attente des résultats ;
5. combinaisons publiées ;
6. analyses des matchs ;
7. sources et avertissement.

L’ordre d’une page de grille réglée est :

1. fil d’Ariane compact ;
2. identité et statut ;
3. bilan virtuel de la grille ;
4. résultats officiels ;
5. rapports officiels ;
6. combinaisons avec leurs scores, verdicts et gains ;
7. analyses des matchs ;
8. sources et avertissement.

Les combinaisons précèdent toujours les analyses longues. Aucune donnée décisive n’est enfermée dans un accordéon.

## 2. Identité visuelle

Preuve90 évoque une interface sportive technologique : précise, nocturne et énergique. L’inspiration cyberpunk reste une tension graphique, jamais un décor littéral.

- fond bleu nuit presque noir avec grille CSS très discrète ;
- cyan électrique et magenta comme couleurs de marque ;
- vert réservé aux résultats positifs ou corrects ;
- rouge réservé aux résultats négatifs ou incorrects ;
- jaune réservé à l’attente ;
- textes principaux presque blancs et textes secondaires bleu-gris ;
- labels, index, statuts et données techniques en monospace système ;
- titres et montants en pile sans-serif système, sans police distante ;
- halos courts et localisés, jamais un néon permanent ;
- effets HUD réservés aux zones importantes ;
- contenus longs présentés sur des surfaces plus sobres.

L’interface ne doit pas devenir une collection de rectangles identiques. Les zones dominantes peuvent employer un cadre plus expressif, tandis que les combinaisons, analyses, sources et archives privilégient la lisibilité.

Les variables exécutables vivent dans `src/styles/tokens.css`. Le cyan et le magenta identifient la marque ; ils ne remplacent pas les couleurs sémantiques.

Les caractères U+2013 et U+2014 sont interdits. Utiliser selon le contexte le tiret ASCII, les deux-points, des parenthèses ou le mot `contre`.

## 3. Composants principaux

### Bilan des grilles terminées

Le bilan principal affiche trois valeurs calculées :

- résultat net des grilles terminées ;
- mises des grilles terminées ;
- retours officiels des grilles terminées.

Le résultat net occupe le plus grand espace et utilise une taille nettement supérieure. Son libellé sémantique, son signe et son montant sont visibles lorsqu’au moins une grille est réglée. Les montants emploient des chiffres tabulaires.

La mise des grilles encore en attente ne figure pas dans ce bilan. Lorsqu’elle est positive, elle apparaît dans un encart secondaire sous la forme d’une phrase simple. Sans grille terminée, le bilan affiche un état neutre et ne présente pas un résultat nul comme une performance.

### Performances

Le rendement est calculé uniquement sur les mises des grilles terminées. Les nombres de grilles et de combinaisons sont regroupés par famille. Le meilleur score est affiché sous la forme `x/y`, accompagné de sa formulation en toutes lettres.

Les libellés publics restent simples :

- grilles publiées ;
- terminées ;
- en attente ;
- combinaisons publiées ;
- combinaisons gagnantes ;
- meilleur score ;
- rendement des grilles terminées.

### Navigation des formules

Sur l’accueil, quatre cartes donnent accès à LF7, LF8, LF12 et LF15.

Sur une page de formule :

- sous 48 rem, seule la navigation mobile fixe est visible ;
- à partir de 48 rem, la navigation mobile fixe disparaît et une navigation compacte affiche la vue d’ensemble ainsi que LF7, LF8, LF12 et LF15 ;
- la formule active est indiquée avec `aria-current` et un traitement visuel distinct.

Les pages de formule affichent `Accueil / Loto Foot [formule]`. Les pages de grille affichent `Accueil / Loto Foot [formule] / Grille [numéro]`. Le fil d’Ariane est une navigation à liste ordonnée, sans cadre dominant, dont le dernier élément porte `aria-current="page"`.

Une page de grille utilise la route imbriquée `/loto-foot/[formula]/grilles/[id]/`. La formule de l’URL doit correspondre à celle de la publication, sinon la page répond 404. Cette structure rend automatiquement actif le lien LF7, LF8, LF12 ou LF15 du header, sur ordinateur comme sur mobile, grâce à la logique existante basée sur le préfixe du chemin. La route historique de détail est supprimée sans redirection.

### Carte de publication

Chaque carte expose :

- numéro et formule ;
- statut explicite ;
- clôture ;
- mise virtuelle ;
- retour officiel ou état d’attente ;
- résultat net lorsqu’il existe ;
- meilleur score lorsqu’il existe ;
- lien `Voir la grille`.

Le statut peut être `Ouverte`, `En attente` ou `Réglée`. Une grille ouverte n’a pas dépassé sa clôture. Une grille en attente l’a dépassée sans résultat. Une grille réglée possède un résultat officiel.

Les cartes utilisent une bordure et un rayon simples. Les effets lumineux ne doivent pas concurrencer les informations.

### Indication temporelle

Le composant de clôture utilise uniquement `validationDeadline`.

Avant la clôture, il affiche le temps restant sans secondes. Après la clôture et avant le règlement, il affiche le temps écoulé et le texte `Résultats officiels en attente`.

Il ne prédit jamais l’heure de publication des résultats. Le rendu initial est valable côté serveur et la valeur est actualisée au maximum une fois par minute côté client. Une date invalide produit un état neutre `Clôture indisponible`.

### Résultats officiels

La suite officielle est une liste ordonnée dans une bande compacte. Une case cyan régulière associe chaque sélection `1`, `N` ou `2` au numéro du match. Toutes les sélections partagent le même traitement cyan ; le magenta reste un accent décoratif sans valeur sémantique. L’en-tête interne rappelle l’ordre officiel et affiche la date d’enregistrement. La grille s’adapte sur plusieurs lignes sans écraser les cellules ni créer de défilement horizontal. La suite reste du texte HTML et n’est ni dessinée dans un canvas ni injectée après chargement.

Cette section n’apparaît que lorsqu’un résultat officiel existe.

### Rapports officiels

La section affiche exactement les éléments présents dans `result.payouts`. Chaque ligne associe le nombre de bonnes réponses et le montant officiel correspondant.

Un rapport absent n’est jamais inféré. La section complète n’apparaît pas avant le règlement.

### Grille de combinaison

Chaque combinaison utilise une table non interactive avec :

- numéro du match ;
- rencontre sous la forme `équipe à domicile contre équipe à l’extérieur` ;
- colonnes `1`, `N` et `2` ;
- choix publié représenté par un cercle plein ;
- résultat officiel non sélectionné représenté par un anneau cyan ;
- choix correct représenté par une coche verte ;
- choix incorrect représenté par une croix rouge ;
- nom, index et justification ;
- score global et gain officiel après règlement ;
- état `En attente`, `Gagnante` ou `Perdue`.

Un cercle vide indique un choix non sélectionné. Les cellules étroites contiennent uniquement ces symboles compacts et conservent un `aria-label` complet. Le verdict textuel se place sous les équipes : `Choix correct` ou `Choix incorrect · Résultat officiel : N`. La légende reprend les mêmes symboles et libellés courts. Aucun état ne dépend uniquement de la couleur.

La grille conserve les trois colonnes `1`, `N` et `2` sur petit écran. Les noms d’équipes peuvent revenir à la ligne et aucun défilement horizontal ne doit être imposé.

La grille de combinaison porte elle-même la comparaison avec le résultat officiel. Aucune section distincte de comparaison match par match ne doit être ajoutée.

### Analyses

Chaque match utilise un élément natif `details` avec un `summary` d’au moins 44 px. Une fois ouvert, il contient :

- probabilités `1`, `N` et `2` ;
- résumé ;
- facteurs principaux ;
- incertitude ;
- sources ;
- date de consultation ;
- résultat et score final lorsque disponibles.

La fermeture initiale réduit le poids visuel sans cacher une donnée essentielle au bilan.

### Sources et transparence

Les sources sportives restent associées à chaque analyse. La zone finale contient le lien officiel de la grille, les sources de règlement lorsqu’elles existent et l’avertissement public.

Une grille non réglée ne présente pas de bloc vide annonçant de futures sources de règlement.

## 4. États

### Cycle d’une grille

- `Ouverte` : résultat indisponible et clôture future ; cyan et mot explicite.
- `En attente` : clôture passée et résultat indisponible ; jaune et mot explicite.
- `Réglée` : résultat officiel disponible ; vert et mot explicite.

### Résultat financier

- positif : `Bénéfice`, signe `+`, vert ;
- négatif : `Perte`, signe `-`, rouge ;
- nul : `Équilibre`, montant nul, traitement neutre ;
- non réglé : aucun résultat net définitif.

### Choix et combinaison

- correct ou gagnante : symbole ou mot explicite avec vert ;
- incorrect ou perdue : symbole ou mot explicite avec rouge ;
- non réglé : choix publié sans verdict par ligne, avec un état général d’attente.

Aucun état ne dépend uniquement de la couleur. Le contraste reste suffisant lorsque les effets lumineux et les animations sont supprimés.

## 5. Responsive

Le socle commence à 320 px. Les contenus ont une largeur minimale de zéro, les nombres restent contenus et les libellés longs peuvent revenir à la ligne.

- 320-767 px : navigation mobile fixe, navigation compacte masquée, bilan empilé, cartes sur une colonne et tables de combinaison resserrées ;
- 768-1023 px : navigation compacte visible, bilan en composition asymétrique, statistiques et cartes sur deux colonnes lorsque l’espace le permet ;
- 1024 px et plus : cartes de publication sur trois colonnes lorsque le conteneur le permet, bilan de grille sur quatre zones et combinaisons sur une colonne de lecture ;
- jusqu’à 1440 px : largeur de lecture plafonnée par le conteneur produit, sans grandes zones vides.

À 200 % de zoom, les règles responsive doivent naturellement revenir aux compositions mobiles. Aucun composant critique ne fixe une largeur provoquant un défilement horizontal.

## 6. Mouvement GSAP

Les animations renforcent l’ordre de lecture :

- arrivée successive des indicateurs financiers ;
- interpolation visuelle des montants depuis zéro ;
- apparition progressive des performances ;
- révélation successive des résultats officiels ;
- apparition des rapports ;
- décalage court entre les cartes de combinaison ;
- apparition progressive des cartes de publication ;
- balayage ou tracé technique ponctuel sur les zones clés.

Chaque groupe animé est encapsulé dans un composant Qwik dédié. `useVisibleTask$` déclenche le chargement lorsque ce groupe entre dans la zone visible. GSAP reste chargé dynamiquement par `src/lib/client/gsap.client.ts`.

Règles d’implémentation :

- le HTML serveur contient toujours les valeurs finales visibles et accessibles ;
- l’animation des compteurs ne modifie que leur copie visuelle, masquée aux technologies d’assistance ;
- aucun contenu n’est masqué avant que GSAP soit disponible ;
- `gsap.context` limite chaque animation à sa section ;
- chaque contexte est annulé au démontage ;
- `transform` et `opacity` sont privilégiés ;
- les durées restent généralement entre 280 et 720 ms ;
- aucune boucle permanente, aucun calcul au scroll et aucun `ScrollTrigger` sans besoin fonctionnel ;
- si `prefers-reduced-motion: reduce` est actif, aucune animation GSAP n’est lancée.

Le contenu reste complet sans JavaScript. Un échec de chargement de GSAP ne peut pas laisser une section invisible.

## 7. Performance

- aucune police distante ;
- aucun canvas, WebGL, vidéo ou image décorative lourde ;
- texture et halos réalisés en CSS ;
- GSAP chargé à la demande par section ;
- animations limitées à l’opacité, aux transformations et à de courts compteurs ;
- aucune animation permanente ;
- aucune dépendance supplémentaire pour la présentation ;
- aucune mesure de mise en page répétée pendant le scroll ;
- dimensions stables pour éviter les décalages de mise en page.

## 8. Accessibilité

- lien d’évitement vers le contenu principal ;
- hiérarchie de titres unique et continue ;
- focus clavier visible avec contraste renforcé ;
- cibles interactives d’au moins 44 px ;
- `details` et `summary` natifs pour les analyses ;
- tables de combinaison avec en-têtes de colonnes et de lignes ;
- résultats officiels exposés comme listes ordonnées ;
- fils d’Ariane exposés comme navigations à listes ordonnées ;
- montants animés doublés d’une valeur finale accessible inchangée ;
- symboles décoratifs ignorés lorsque le texte accessible porte déjà le sens ;
- statut, verdict et résultat financier exprimés par des mots ;
- interface utilisable sans JavaScript, sans animation et à 200 % de zoom.

## 9. Critères de validation

Les routes `/`, `/loto-foot/[formule]/` et `/loto-foot/[formula]/grilles/[id]/` sont vérifiées à 320, 375, 768, 1024 et 1440 px. À chaque largeur :

- aucune barre de défilement horizontale ;
- la navigation ne masque pas le contenu ;
- aucune navigation de formule n’est dupliquée sur mobile ;
- le bilan financier distingue les grilles terminées des mises en attente ;
- une formule vide n’affiche pas un tableau de zéros ;
- une grille non réglée n’affiche pas de sections de règlement vides ;
- les rapports proviennent uniquement des données officielles ;
- les scores proviennent uniquement des règlements calculés ;
- les choix corrects et incorrects restent identifiables sans couleur ;
- les contenus essentiels restent présents lorsque JavaScript est désactivé ;
- la réduction des mouvements supprime les animations sans altérer la composition.
