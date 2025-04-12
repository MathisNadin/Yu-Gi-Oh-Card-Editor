## mn-toolkit change log

## 7.1.0

- chargement de Roboto en local plutôt que via les urls google

## 7.0.10

- bump to 7.0.10
- display block sur les inputs + min-width imposée à 0 sur les inputs pour ignorer les valeurs user agent des navigateurs
- adaptation des rows sur TextAreaInput au resize et au display none
- dedoublonnage de la mixin text overflow + nowrap dans les popovers actions

## 7.0.9

- bump to 7.0.9
- eviter le highlight case par case dans une table

## 7.0.8

- bump to 7.0.8
- AxiosService plus complet

## 7.0.7

- bump to 7.0.7
- ajout gestion transparent dans les fonctions hsl + frame shadow de 0 à 6 sur les props de Container

## 7.0.6

- bump to 7.0.6
- ajout style hover sur table row

## 7.0.5

- bump to 7.0.5
- bg transparent sur les nums du ClassicPager + loaded initial pris en compte sur AbstractView + plus d'options sur ScreenSpec

## 7.0.4

- bump to 7.0.4
- adaptation aux nv typings dans mn-tols

## 7.0.3

- bump to 7.0.3
- fix pour la shape

## 7.0.2

- bump to 7.0.2
- utiliation d'un élément img au lieu de background-image pour le member badge

## 7.0.1

- bump to 7.0.1
- utilisation d'un set dans PermissionService pour optimiser les performances

## 7.0.0

- bump to 7.0.0
- utilisation des cookies pour le token de session + refonte de SessionService

## 6.4.4

- bump to 6.4.4
- TDerivative devient gobal + ajout de TPermission en global + les effets utilisent désormais webp

## 6.4.3

- bump to 6.4.3
- loaded false dans RouterViewPort sur StateStart pour éventuellement attendre pendant le getInitialData
- searchDebounce sur SearchBar désactivable + fix classe du btn container sur Icon
- classe de la platform constante + ajustement des espaces de scroll avec padding sur mobile
- fix hauteur de certains fields pour le mobile

## 6.4.2

- bump to 6.4.2
- max width sur le header content + class enabled sur sortable

## 6.4.1

- bump to 6.4.1
- fix du didUpdate manquant sur ChipsInput

## 6.4.0

- bump to 6.4.0
- ajout sortable dialog et reorder icon

## 6.3.2

- bump to 6.3.2
- fix prise en compe absente du canReset sur les icon delete des time date et week picker

## 6.3.1

- bump to 6.3.1
- typing des href là où ça manquait

## 6.3.0

- bump to 6.3.0
- ajout Accordion
- ajout checkbox field
- optimisation href et ajout fontSize dans Typography
- ajout AnchorContainer

## 6.2.11

- bump to 6.2.11
- aligner verticalement les left et right contents dans TopMenu

## 6.2.10

- bump to 6.2.10
- fix padding sub header + fix fullscr surimage

## 6.2.9

- bump to 6.2.9
- fixs sur search bar et sub header

## 6.2.8

- bump to 6.2.8
- fix ciblage des styles grid

## 6.2.7

- bump to 6.2.7
- CheckboxTreeField + fix tailles dans Chips Input

## 6.2.6

- bump to 6.2.6
- RichTextEditor ne gère que ses propres popups
- ajout remove last sur popover et toaster

## 6.2.5

- bump to 6.2.5
- grid, content, footer, et header étendables

## 6.2.4

- bump to 6.2.4
- fix taille du sticky pane enmode sticky

## 6.2.3

- bump to 6.2.3
- text overflow sur les left menu subitems

## 6.2.2

- bump to 6.2.2
- gérer les query strings additionnels dans getLink
- Merge branch 'master' of https://github.com/MathisNadin/mn-toolkit
- typography doit être en display block
- max content width en small screen doit être 100%

## 6.2.1

- bump to 6.2.1
- fix de certaines line-height

## 6.2.0

- bump to 6.2.0
- fix width des button et labeled group label + fix refs sur les Drawer, Popups, et FullscreenImage services + pas d'animation à la disparition d'une fullscreen image
- border sur les drawers
- gestion theme dans Containable + ajout StickyPane et style spécifique pour TopMenu et RouterViewport
- user select none retiré dans reset + ImageDialog -> FullscreenImage géré de façon autonome + overlay sur ça et Drawer
- Retour de Drawer complètement revu
- ajout ImageDialog + implémentation sur Image
- fix style shrink btn du MenuPane
- fix dom des crawler items du top menu + fonction updateUrl dans RouterService
- utilisation de nav, ul, et li sur les menus
- implémentation li dans SelectChipsPopover
- ul et li dans ActionsPopover + fix action.button
- utilisation de ul dans checbox tree
- ajustement style et corrections sur les pagers + Pager -> ClassicPager
- Pager -> TablePager + nouveau Pager
- gestion du drag and drop dans PictureEditor
- min height sur un picture editor en free size
- fix fg 1
- réglage de menu-contracted-width
- corrections sur Checkbox + ajout CheckboxTree
- affichage propre des title et subtitles sur les popovers avec action
- fixs visuels sur SelectChips
- fg 1 doit être un noir total

## 6.1.9

- bump to 6.1.9
- render plus complet sur typography

## 6.1.8

- bump to 6.1.8
- unserialize correct des server data

## 6.1.7

- bump to 6.1.7
- member plus souple sur MemberBadge

## 6.1.6

- bump to 6.1.6
- fix style du center-part du header + plus de variable maxContentWidth

## 6.1.5

- bump to 6.1.5
- token à fournir dans getUrl + createFile prend des specs en entrée

## 6.1.4

- bump to 6.1.4
- interface séparée pour les colspans + meilleur typing de initialServerData sur TRouterParams

## 6.1.3

- bump to 6.1.3
- gestion des vues avec un root path + base url with hash devient static

## 6.1.2

- bump to 6.1.2
- fix process path
- ajout d'un / à la fin du path
- fix update entre props et search bar
- text overflow a besoin de inline-block

## 6.1.1

- bump to 6.1.1
- fix buildPath

## 6.1.0

- bump to 6.1.0
- Merge branch 'master' of https://github.com/MathisNadin/mn-toolkit
- gestion des tags et du fallbackState de chaque vue
- Merge branch 'master' of https://github.com/MathisNadin/mn-toolkit
- utilisation du getPathFromFile via le renderer directement
- rework du router pour utiliser une baseUrl au lieu de #!

## 6.0.2

- bump to 6.0.2
- ajout de la license et déplacement des déps sur webpack

## 6.0.1

- bump to 6.0.1
- update dependances eslint et electron + utilisation de serialize partout

## 6.0.0

- bump to 6.0.0
- fix header children
- fix renderFooter + fix typing dans RouterService
- ajustement couleur des tabset item label
- retour de overrideOnTapIcon sur FilePathInput
- polish dans react et router services
- correction du labeled group
- ajustement du letter spacing
- diminution de l'utilisation de la mixin on + nommage propre des types TS + fonction wait
- corrections ouverture des href externes sur typo et menus
- def des fonts en variables css + utilisation partout + split des styles globaux en plusieurs fichiers
- suppr des rgba et hexa restants
- suppr des fonctions scss white et black
- fix taille des rich text editor et field
- ajustements divers pour le dark mode et fonctionnels sur certains composants
- conversion rgb -> hsl sur toutes les variables et les dark theme + fixs affichage left menu
- toggle light/dark theme sur le theme service + fixs visuels des ancres sur les menus + right et left content sur le top menu
- nettoyage des styles de typography
- gestion générique du mn-disabled
- typing correct des events react
- notation override sur les defaultProps + extension ocrrecte sur les Drawers, 404, GalleryContainer
- correction AbstractView + fixs et ajustements de rendu de Toaster, Popup, Popover, et TopMenu
- fusion de View et AbstractViewComponent
- homonégéisation des render et children sur la plupart des composants
- fileInput -> filePathInput
- quelques ajouts de refs + tous les styles du toolkit dans une mixin~
- restructuration des fichiers en system/components
- restructuration des fichiers en system/components

## 5.0.8

- bump to 5.0.8
- icone adaptative sur le picture editor

## 5.0.7

- bump to 5.0.7
- meilleur typing dans Application + chgt logique de render du TabbedPane

## 5.0.6

- bump to 5.0.6
- adaptation aux nv patchs tools

## 5.0.5

- bump to 5.0.5
- amélioration du typing sur store.get et electron + davantage d'options sur le popup choice

## 5.0.4

- bump to 5.0.4
- Merge branch 'master' of https://github.com/MathisNadin/mn-toolkit
- meilleur render dans spinner pour avoir accès à la ref
- adaptation aux nvinterfaces de file api

## 5.0.3

- bump to 5.0.3
- ajout de fromBlur dans onChange de InplaceEdit
- types webpack dev server inutile car déprécié

## 5.0.2

- bump to 5.0.2
- fix export masonry

## 5.0.1

- bump to 5.0.1
- pas besoin de react image crop en standard
- fix import index.scss de la library

## 5.0.0

- bump to 5.0.0
- affinage du script bump
- bump to 5.0.0
- amélioration du script bump version
- script de changelog plus générique
- ajout changelog
- fix d'extension des scripts + ajout des dependencies
- restructuration de la libairie + ajout des scripts
- fix did update du text area input
- note de plein d'overrides avec les appels super
- corrections et ajouts sur table
- refonte totale deTable
- fix style topy sur laligne height et la font de latypo help
- ajout Masonry
- fix text area input
- Merge branch 'master' of https://github.com/MathisNadin/mn-toolkit
- fix file uploader
- fix css checkbox et callout
- fix darken lighten rgb
- typing
- filename dans l'ap download electron
- fixs chips input et styles color
- ThemeService
- update rich text editor pour couleurs et callouts

## 4.0.6

- bump to 4.0.6
- fix line height sur typo + utilisation escapeHTML
- chgt defaultalue sur ChipInput + keys sur Breadcrumb
- retour au vieux RichTextEditor
- edits mineurs sur rich text
- can reset sur les date time input manquants
- correction quill + rework visuel PictureEditor + cameraPicker
- fix styles et onChange de FormField
- adaptation aux nv propriétés de member
- ajustemens visuels divers
- fixs form prop icon
- fix classe scss et typing router et crop effect
- suppr dela logique de scale sur le crop effect + ref adaptable sur containable + refde l'icone + style et render member badge
- refonte complète du PictureEditor et Cropper
- gap différent sur actions popover + nouveau InplaceEdit
- fixs divers
- gestion des a et button + nettoyage form et formFields
- chips input et select + ajustement style divers
- fix date time range did update
- fixs sur date time + ajout week
- yearRange partout
- ajustements rich text depuis le boulot
- ajustements sur le color picker
- implémentaiton rich text editor
- réglages visuels des fields de time et text area
- corrections diverses sur les date et time
- ajout date time range picker
- correction top menu + date range picker
- ajout date time + ajustements sur popover et popup
- ajustements sur les date et time pickers
- ajout de tout le time picker
- début sur date et time avec le DatePicker
- ajustements style bouton + ajout chip
- fix tips + ajustement logique popover service
- nv gestion api download
- gestion différente des tailles de screen + travail sur didUpdate didMount et willUnmount + gestion des tips
- ménage dans apiService
- fix utilisation buttonIcon au lieu de Icon + bubble dans le RichTextEditor
- animation popover
- correction header et menu
- portage des modifs sur popup et popover

## 4.0.5

- 4.0.5
- rework des sessionData
- utiliser unserialize dans le store
- correction labeled group
- inutile ?

## 4.0.4

- 4.0.4
- fix aspect visuel du scroller y et x avec margin et padding et gutter

## 4.0.3

- 4.0.3
- fix de plusieurs inputs + style scroll avecpadding

## 4.0.2

- 4.0.2
- derniers travaus sur la v2 du card editor
- premiere partie sur le card editor

## 4.0.1

- 4.0.1
- travail sur le style + capacitor + les classes et attributes + divers composants
- ajout groupWrap sur LabelledGroup
- fix ids des toasts, popovers, et popups + fix TopMenu

## 4.0.0

- bump to 4.0.0
- énorme travail
- fix erreurs ts

## 3.0.4

- bump 3.0.4
- supp typo attention + styles des Menus
- top et left menu
- nv logique des typography
- fixs de style scroll et select field
- nv logique de scroller
- style des FormFields
- ajout Group et LabeledGroup
- setState incongru
- fix form et logique des popups
- prettier

## 3.0.3

- bump 3.0.3
- searchBar + savingManager + fixs divers
- fix config api et setups
- fixs d'imports etsur RouterPortView
- picture + richText + slider + toolbar + colorPicker + gallery + svgs
- ajout forms
- ajout memberbadge + pager + toaster + bcp de svgs
- axios devient api + nv apiService + session + permission
- upgrade RouterViewPort

## 3.0.2

- bump to 3.0.2
- format + imports changés
- observable est dans tools
- renommage et imports

## 3.0.1

- bump to 3.0.1
- merge
- bump 2.0.2
- file picker et uploader

## 3.0.0

- revamp et adaptation au nv builder

## 2.0.2

- bump 2.0.2
- file picker et uploader

## 2.0.1

- fixs + bump 2.0.1
- settings à renseigner

## 2.0.0

- bump to 2.0.0
- nouveautés

## 1.0.3

- gestion du css + button

## 1.0.2

- bump to 1.0.2
- deviceService + fonction setup
- avec package.json

## 1.0.1

- là y a table et typo
- corrections sur Pane + ajout Typo et Table
- build css

