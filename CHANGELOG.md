## yu-gi-oh-card-editor change log

## 2.4.0

- implementation codexygo
- gestion limitation text et cardclass et cartes non-game + update interfaces
- preps 2.4
- up libs
- fix nowrap sur les card abilities

## 2.3.2

- bump to 2.3.2
- gestion des chars grecques non affichés par les polices de base
- up toolkit
- up libs
- up libs et sync deps/scripts

## 2.3.1

- bump to 2.3.1
- axios va dans dependencies pour le main process

## 2.3.0

- bump to 2.3.0
- up libs + limite des extensions de fichier pour les images + triangles pour faire les flèches lien dans l'éditeur
- up libs
- up libs
- frame effect par défaut sur les imports yuginews
- ordre de tri dans les imports sur l'ajout ou l'ordre sur la page
- adaptation au tk v8
- implementation de la même triche sur l'affichage des fusions/rituels sans aucun effet principal sur l'import yuginews
- fix style normal text
- up libs
- rush effect type par défaut sous certaines conditions dans le wiki text parser
- requetes axios via le main process pour pouvoi definir un user agent propre
- amélioration du parsing yugipedia et scheduler pour l'api
- fix import yugipedia sur rushTypEeffect en master et rushTestMode pour l'affichage des cartes rush sans effet
- meilleur import des skills et trads de leurs persos + fix affichage skill name
- fix parsing card effect quand on a un flip ou pas de matériels
- ajout de noUncheckedIndexedAccess dans la config ts
- up tk avec nv grid et xxxlarge

## 2.2.1

- bump to 2.2.1
- fix du chargement des fonts

## 2.2.0

- bump to 2.2.0
- ajout tests jest
- contenu du README
- logos des sites plus sympas
- ajustements de style
- gestion du char #
- utilisation de sanitizeFileName + mediaWiki -> yugipedia + parsers pour le wikitext + gestion du char plusminus
- up libs
- fix import des K9 + import des artworks yugipedia plus robuste
- up libs
- forcer le zoom à 100% pour eviter les pb de rendu de l'image
- up libs
- up libs
- chgt logique pour recup l'artwork name
- ajout de l'app icon en mode dev
- up electron-main et tk + adaptations aux nouvelles pratiques du router
- up libs
- léger reworking des fichiers de config
- réorga des imports, fix des scripts pour webpack, et utilisation des variables d'env pour les ports devServer
- sync des scripts et deps
- début de la reorganisation du builder webpack
- mise à jour des deps eslint et electron
- fix condition manquante dans RushCardDesc + possibiel de suppr un rush choice eff que si on en a plus de 2
- up libs
- fix date modifiée dans la library + fix letter spacing dans les cartes + goto renvoie désormais des promises
- ajustements visuels pour concorder avec le nouveau tk
- up toolkit et tools + update webpack
- implémentation de config
- update dependencies
- up toolkit

## 2.1.6

- bump to 2.1.6
- nettoyage import card interfaces + unification des logiques de taille des descriptions et effets
- utilisation de Promise.all pour gagner du temps sur l'import yugipedia + fonctions à paramètres pour améliorer la clareté
- up libs
- gérer aussi condition à la place de summoning_condition
- ajout du parsing du text dans le wikitext
- correction de l'affichage des notes de mise à jour

## 2.1.5

- bump to 2.1.5
- pas d'abilities sur un simple token rush
- correction de la gestion des sauts de ligne sur les otherEffectTexts dans l'import yuginews
- meilleure gestion des retours à la ligne et lignes vides dans les processed texts
- correction du parsing du dom pedia et yuginews + style Skill dans le tableau d'import + meilleure gestion de l'import des skills
- fix import des sets depuis yugipedia
- corrections dans l'import DOM d'articles Yuginews
- type galactique -> type galaxie
- ajout du menu Aide + déplacement de la logique d'update côté renderer
- interface pour l'update + meilleur typing sur le store.get
- rework de la structure de mn-electron-main
- fix policedes caractères spéciaux sur le nom en master
- amélioration et fixs sur l'import Yugipedia

## 2.1.4

- bump to 2.1.4
- up tk
- harmonisation des checkStates des textes + correction des checkStates superposés
- rework complet du parsing du script yuginews
- parsing du pend eff comme la description
- restructuration du yuginews service

## 2.1.3

- bump to 2.1.3
- rework du système de debouncing sur les éditeurs + améliorations visuelles sur le dialogue artwork editing
- utilisation de React Fragment pour les processed texts
- chgt du système des notifs de mise à jour

## 2.1.2

- bump to 2.1.2
- affichage et police du arobase tcg
- premiers essais sur le tcg at
- ajustement dela taille des bullet points
- edition plus smooth sur les inplace edits
- fix key sur les inplace edits
- restructuration mn-html-to-img
- preload des images
- ignore changelog prettier
- up tk
- sync dependencies
- up libs

## 2.1.1

- 2.1.1
- simplification sans montrer les notes de version
- fix updater dialog et clean html

## 2.1.0

- 2.1.0

## v2.1.0

- suppression de l'ancienne logique d'update
- move electorn updater dans les dependencies

## 2.0.5

- implémentation electron updater + 2.0.5
- amélioration du moteur de rendu des sub builbers
- correction de plein d'overrides et appels super
- up dependances
- update table + amélioration vues concernées et vue settings
- rework du dialog artwork editing
- affichage des multi effects mis à jour
- up tk
- up electron main
- up libs
- effet au choix devient multi-choix
- up libs
- up lib avec theme service + simplification du code du dialog artwork
- fix accents dans yuginews service + split des urls yugipedia
- up libs
- up dependencies
- fix erreur escape char
- fix dépendances

## 2.0.4

- 2.0.4
- debouncing plus flexible selon ce qui est édité
- scroll corrigé visuellement + copyright aussi
- fix bullet points dans les effets pendule

## 2.0.3

- 2.0.3
- fix affichage en grid + nettoyage artwork dialog + fix inputs qui lagent + style scroll avec padding

## 2.0.2

- 2.0.2
- double utilisation de requestAnimationFrame au lieu de setTimeout + on vire tous les querySelector restants

## 2.0.1

- bump to 2.0.1
- fix des require et passage par le card service quand possible
- meilleure interface pour le rendu de la carte éditée
- fix logique hasAbilities sur le rush + plus d'utilisation du querySelector et meilleure gesiton du spinner sur les previews
- meilleure gestion du needsUpdate
- set timeout surles onready des subBuilders

## 2.0.0

- bump to 2.0.0
- merge v2
- fix webpack config
- là c'est fix
- oula
- fix timing checkUpdate
- up des libs
- fix style du Select
- electron-dl dans les depencencies

## 1.0.4

- bump to 1.0.4
- fix height du popover
- petit fix dans Settings
- probablementmieux de gérer le didUpdate come ça dans les textInputs
- fix load del'image à cropper
- fix tabIndex à l'update
- baseArtUrl mise à jour + optimisation du rendu et debug editeurs de texte
- encore des keys
- onChange au lieu de onInput sur les fields
- styles textareainput
- setState pas dans les constructors
- bonneapp id et productName danselectron builder
- ajout jsx keys
- le state est toujours défini par le parent ici
- willReceiveProps -> componentDidUpdate sur le reste, à tester
- debut didUpdate + nv textArea
- fix style dans popup
- linting et prettier sur tout le code
- config prettier
- devtools + render sur root
- fixs au lancement
- reorga avec coreService et  HomeView
- ajout de plein dechoses dans le toolkit + base de page et core
- ajout de router et view
- extendNativeObject dans letoolkit
- derniers  réglages de template + de connexion en mode dev
- menu presque fini
- typing des fonctions ipc + prep au menu
- load de la conf depuis package.json
- on vire babel
- ajout filePicker + adaptation au mode desktop
- deplacement des assets
- import des styles
- adaptation des imports dans client
- imports et exports des fichier ts et tsx dans le toolkit
- typing
- re add toolkit
- rm toolkit
- re add tools
- rm tools
- rajout de la lib html img
- remove html img
- import du nv builder
- test clonage

## 1.0.3

- bump 1.0.3
- oopsie dans import lien yuginews

## 1.0.2

- bump to 1.0.2
- try catch partout
- fix taille dialog import
- base url pourmoi

## 1.0.1

- bump to 1.0.1
- taille import pedia + fix key dans rush choice eff + replace pour query pedia
- settings
- bump toolkit vers

## 1.0.0

- style notif update + bump to 1.0.0
- derniers travaux
- dialogues
- dialogue artwork
- homePanes
- suite settings et handler
- travail sur rush editor
- travail sur localCardsDisplay
- couleur textes accentuée
- fin design principal du card editor master
- suite
- commit de sa mere
- ver dans release

## 0.9.2

- gestion du style + button + checkUpdate
- fix import artwork + fix regex cardName
- up libs + fix import rush yuginews
- build css
- dossier libraries
- creation de mn-tools
- nettoyage eslint

## 0.9.1

- bump to 0.9.1
- convertion carte master en rush

## 0.9.0

- bump to 0.9.0
- derniers ajustements de style + special-char-span
- impot rush yuginews
- fix download + import yugipedia rush
- fix affichage sans cacher art rush + presetsRush artwork
- ajout fordbiddenDeck + fin render Rush
- effets et abilities rush
- avancées sur Rush (legend, cover art etc) + fix bullet points master
- avancée sur limitations et debut config legend et dontCoverArt
- ajustement atk def atk max
- suite card rush - atk def passcode
- travail sur cartes rush
- début ajout rush

## 0.8.2

- bump to 0.8.2
- inplaceEdit validateOnEnter
- trad des abiletés via import yugipedia + fix saut a la ligne yuginews
- bump to 0.8.1

## 0.8.1

- fix oubli + placeholder dossier d'import artwork
- bump to 0.8.0

## 0.8.0

- fin import artworks
- fonctions import artwork yugipedia

## 0.7.1

- bump to 0.7.1
- fix cache import yuginews + import des vieux articles
- ajustements et  préparation à l'imports des vieux articles yuginews + bumpt to 0.7.0

## 0.7.0

- tri des imports yuginews
- import yuginews

## 0.6.3

- deplacement media wiki + replacene repalce All pour la replaceMatrix + bump to 0.6.3

## 0.6.2

- bump to 0.6.2
- plus de html-to-image

## 0.6.1

- bump to 0.6.1
- ajout bullet point dans pend text
- html-to-image perso + fix bulletpoints dans description
- ajout app.settings
- bump to 0.6.0

## 0.6.0

- generation de passcode
- nettoyage + qq corrections de bugs
- nettoyage
- fin redesign editieur
- cadre pendule + pastille numéro type de carte
- basic card details rework
- rajout de l'option field + fix taille cache

## 0.5.4

- bump to 0.5.4
- fix artwork editing + scroll table + presets
- bouton reinitialiser + meilleur style selection + déplacement description

## 0.5.3

- bump to 0.5.3
- ajout langues icones et editions

## 0.5.2

- bump to 0.5.2
- suite nettoyage
- nettoyage

## 0.5.1

- bug fixs + bump 0.5.1
- bump to 0.5.0

## 0.5.0

- imports et export
- mode zarc
- bon en fait non
- fix algo converNameToImg
- frame à frames + tests zarc
- avancee diverses
- tests sur rendu collectif
- ajout api + début import mediawiki
- suite localCardsDisplay + debut TempCurrentCard
- ajout local cards display
- spinner + cardService + export png de carte

## 0.1.5

- implementation atk def inconnues
- bug fixs + save de la current-card

## 0.1.4

- implementation indexedDB
- implementation des services
- edits package
- texte blanc M/P

## 0.1.3

- oubli atk def

## 0.1.2

- atk def en img
- raretés du nom
- fix taille desc sur skill
- prep tcg at + style card set fix
- fix nom skill
- fix render de carte en deux temps
- update package json

