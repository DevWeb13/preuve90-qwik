# Preuve90 — Système d’interface produit

Ce document est la référence de l’expérience publique Preuve90. L’interface rend vérifiables des pronostics Loto Foot publiés avant leur date limite, puis confrontés aux résultats et rapports officiels. Elle ne promet aucun gain et n’emploie que les données validées et les calculs du produit.

## 1. Hiérarchie de l’information

Le bilan financier virtuel est toujours le premier niveau de lecture. Il distingue immédiatement la mise totale engagée, la part déjà réglée, la part encore en attente, les retours officiels et le résultat net calculé uniquement sur les grilles réglées. Une grille non réglée n’est jamais présentée comme une perte.

L’ordre de la page d’accueil est :

1. promesse produit compacte ;
2. mises engagées, réglées et en attente, retours officiels et résultat net réglé ;
3. rendement des grilles réglées et statistiques secondaires ;
4. archives des grilles ;
5. avertissement.

L’ordre d’une page de grille est :

1. identité compacte, statut et date limite ;
2. bilan financier et meilleur score ;
3. suite officielle des résultats ;
4. rapports officiels ;
5. performances des combinaisons ;
6. comparaison match par match ;
7. analyses d’avant-match repliables ;
8. sources et avertissements.

Les combinaisons et leurs scores précèdent donc toujours les analyses longues. Aucune donnée décisive n’est enfermée dans un accordéon.

## 2. Identité visuelle

Preuve90 évoque un tableau de contrôle sportif futuriste : précis, nocturne, énergique. L’inspiration cyberpunk et casino reste une tension graphique, jamais un décor littéral.

- fond bleu nuit presque noir avec grille CSS extrêmement discrète ;
- cyan électrique et magenta comme couleurs de marque ;
- vert exclusivement réservé aux résultats positifs ou corrects ;
- rouge exclusivement réservé aux résultats négatifs ou incorrects ;
- jaune réservé à l’attente ;
- textes principaux presque blancs et textes secondaires bleu-gris ;
- labels, index, statuts et données techniques en monospace système ;
- titres et montants en pile sans-serif système, sans police distante ;
- halos courts et localisés, jamais un néon permanent ;
- cadres HUD, angles découpés, lignes de mesure et repères lumineux ;
- surfaces différenciées par la composition, la densité, l’accent et la profondeur.

L’interface ne doit jamais devenir une collection de rectangles identiques. Une valeur dominante peut employer un cadre découpé, une liste de rapports une ligne d’énergie latérale, une archive une dalle technique et un accordéon une surface éditoriale plus calme.

Les variables exécutables vivent dans `src/styles/tokens.css`. Le cyan et le magenta identifient la marque ; ils ne remplacent pas les couleurs sémantiques.

## 3. Composants principaux

### Bilan financier

Le bilan distingue cinq valeurs calculées :

- mise totale engagée ;
- mise des grilles réglées ;
- mise des grilles en attente ;
- retours officiels des grilles réglées ;
- résultat net des grilles réglées.

Le résultat net réglé occupe le plus grand espace et utilise une taille nettement supérieure. Son libellé sémantique, son signe et son montant sont visibles lorsqu’au moins une grille est réglée. Sans grille réglée, le net et le rendement affichent un état d’attente, jamais une perte. Les montants emploient des chiffres tabulaires.

### Statistiques secondaires

Le rendement est calculé uniquement sur les mises réglées et reçoit une lecture propre, distincte des compteurs. Les nombres de grilles et de combinaisons sont regroupés par famille. Le meilleur score est un signal autonome sous la forme `x/y`, accompagné de sa formulation en toutes lettres. Ces éléments ne forment pas une grille uniforme de petites cartes.

### Carte d’archive

Chaque archive expose :

- numéro et format de grille ;
- statut explicite ;
- date limite ;
- mise ;
- retour et net lorsqu’elle est réglée, ou état d’attente sinon ;
- meilleur score si la grille est réglée ;
- appel à l’action décrivant la destination.

Le statut peut être `Ouverte`, `En attente` ou `Réglée`. Une grille ouverte n’a pas dépassé sa date limite ; une grille en attente l’a dépassée sans résultat ; une grille réglée possède un résultat officiel.

### Résultat officiel

La suite officielle est une liste ordonnée de grandes pastilles `1`, `N` et `2`. Chaque pastille est associée au numéro du match et la section porte le titre explicite `Résultat officiel`. La suite reste du texte HTML : elle n’est ni dessinée dans un canvas ni injectée après chargement.

### Rapports officiels

La section `Rapports officiels de la grille` affiche exactement tous les éléments présents dans `result.payouts`. Chaque ligne associe le nombre de bonnes réponses, le montant et le libellé `Rapport officiel`. Une phrase explique qu’il s’agit du montant officiel correspondant à ce palier pour cette grille.

Un rapport absent n’est jamais inféré. Sans règlement, la section affiche : `Rapports officiels disponibles après publication des résultats.`

### Carte de combinaison

Chaque combinaison présente :

- nom et index ;
- score en toutes lettres ;
- état `Gagnante`, `Perdue` ou `En attente` ;
- gain calculé ou état d’attente ;
- choix pour chaque match ;
- marque `✓ Correct`, `× Incorrect` ou état d’attente ;
- justification publiée.

Une combinaison est gagnante uniquement si son rapport calculé est positif. La couleur accompagne toujours un mot ou un symbole compris via la légende et les libellés accessibles.

### Comparaison match par match

À partir de 1024 px, un tableau à colonnes fixes compare l’affiche, le résultat officiel et les choix de toutes les combinaisons. Chaque choix porte un verdict textuel.

Sous 1024 px, la même information devient une pile de cartes par match. Le résultat officiel est dans l’en-tête, puis chaque combinaison occupe une ligne. Aucun tableau horizontal n’est imposé sur mobile.

### Analyses

Chaque match utilise un élément natif `details` avec un `summary` d’au moins 44 px. Une fois ouvert, il contient probabilités, analyse, facteurs principaux, incertitude et sources. La fermeture initiale réduit leur poids visuel sans cacher une donnée essentielle au bilan.

## 4. États

### Cycle d’une grille

- `Ouverte` : résultat indisponible et date limite future ; cyan et mot explicite.
- `En attente` : date limite passée et résultat indisponible ; jaune et mot explicite.
- `Réglée` : résultat officiel disponible ; vert et mot explicite.

### Résultat financier

- positif : `Bénéfice`, signe `+`, vert ;
- négatif : `Perte`, signe `−`, rouge ;
- nul : `Équilibre`, montant nul, traitement neutre ;
- non réglé : `En attente`, sans montant net ni rendement définitif.

### Choix et combinaison

- correct ou gagnante : symbole ou mot explicite avec vert ;
- incorrect ou perdue : symbole ou mot explicite avec rouge ;
- non réglé : `En attente` avec jaune ou traitement neutre.

Aucun état ne dépend uniquement de la couleur. Le contraste reste suffisant même lorsque l’effet lumineux est supprimé.

## 5. Responsive

Le socle commence à 320 px. Les contenus ont une largeur minimale de zéro, les nombres restent contenus et les libellés longs peuvent revenir à la ligne.

- 320–767 px : bilan empilé avec net en premier, archives sur une colonne, comparaison en cartes, navigation fixe compensée par l’espace sûr ;
- 768–1023 px : bilan accueil en composition asymétrique, statistiques et cartes sur deux colonnes lorsque l’espace le permet ;
- 1024 px et plus : comparaison en tableau, bilan de grille sur quatre zones, combinaisons sur trois colonnes ;
- jusqu’à 1440 px : largeur de lecture plafonnée par le conteneur produit, sans grandes zones vides.

À 200 % de zoom, les règles responsive doivent naturellement revenir aux compositions mobiles. Aucun composant critique ne fixe une largeur provoquant un défilement horizontal.

## 6. Mouvement GSAP

Les animations renforcent l’ordre de lecture :

- arrivée successive des indicateurs financiers ;
- interpolation visuelle des montants depuis zéro ;
- apparition progressive des statistiques secondaires ;
- révélation successive des pastilles officielles ;
- apparition des rapports ;
- décalage court entre les cartes de combinaison ;
- progression des lignes de comparaison ;
- balayage ou tracé technique ponctuel sur les zones clés.

Chaque groupe animé est encapsulé dans un composant Qwik dédié. `useVisibleTask$` déclenche le chargement lorsque ce groupe entre dans la zone visible. GSAP reste chargé dynamiquement par `src/lib/client/gsap.client.ts`.

Règles d’implémentation :

- le HTML serveur contient toujours les valeurs finales visibles et accessibles ;
- l’animation des compteurs ne modifie que leur copie visuelle, masquée aux technologies d’assistance ;
- aucun contenu n’est masqué avant que GSAP soit effectivement disponible ;
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

- un lien d’évitement mène au contenu principal ;
- hiérarchie de titres unique et continue ;
- focus clavier visible avec contraste renforcé ;
- cibles interactives d’au moins 44 px ;
- `details` et `summary` natifs pour les analyses ;
- tableaux dotés d’en-têtes de colonnes et de lignes ;
- suites officielles exposées comme listes ordonnées ;
- montants animés doublés d’une valeur finale accessible inchangée ;
- symboles décoratifs ignorés lorsque le texte accessible porte déjà le sens ;
- statut, verdict et résultat financier exprimés par des mots ;
- interface utilisable sans JavaScript, sans animation et à 200 % de zoom.

## 9. Critères de validation

Les routes `/` et `/grille/[id]/` sont vérifiées à 320, 375, 768, 1024 et 1440 px. À chaque largeur :

- aucune barre de défilement horizontale ;
- la navigation ne masque pas le contenu ;
- le bilan financier apparaît avant les analyses ;
- les rapports proviennent uniquement des données officielles ;
- les scores proviennent uniquement des règlements calculés ;
- les choix corrects et incorrects restent identifiables sans couleur ;
- les contenus essentiels restent présents lorsque JavaScript est désactivé ;
- la réduction des mouvements supprime les animations sans altérer la composition.
