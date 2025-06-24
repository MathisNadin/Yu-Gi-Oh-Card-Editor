/* eslint-disable @typescript-eslint/no-require-imports */
import { Crop } from 'react-image-crop';
import { toPng } from 'mn-html-to-image';
import { IStoreListener } from 'mn-toolkit';
import { AbstractObservable, deepClone, sanitizeFileName, uuid } from 'mn-tools';
import { CardImportDialog } from '../cardImportDialog';
import { ICard, TCardStorageKey, TFrame, TAttribute, TStIcon, TCardLanguage, TSticker, TEdition, TLegendType } from '.';

export interface ICardsExportData {
  'current-card': ICard;
  'temp-current-card': ICard;
  'local-cards': ICard[];
}

export interface ICardListener {
  currentCardLoaded: (currentCard: ICard) => void;
  currentCardUpdated: (currentCard: ICard) => void;
  tempCurrentCardLoaded: (tempCurrentCard: ICard | undefined) => void;
  tempCurrentCardUpdated: (tempCurrentCard: ICard | undefined) => void;
  localCardsLoaded: (localCards: ICard[]) => void;
  localCardsUpdated: (localCards: ICard[]) => void;
  renderCardChanged: (renderCard: ICard | undefined) => void;
  menuSaveTempToLocal: () => void;
  cardRenderer: (card: ICard) => void;
  cardImported: (newCard: ICard) => void;
}

const COMMON_FRAMES: TFrame[] = [
  'normal',
  'effect',
  'ritual',
  'fusion',
  'synchro',
  'xyz',
  'spell',
  'trap',
  'token',
  'monsterToken',
];

const FRAMES_WITH_DESCRIPTION: TFrame[] = ['normal', 'token', 'monsterToken'];

interface ICardLinkArrowPaths {
  top: string;
  bottom: string;
  left: string;
  right: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}
type TWhiteArtwork = 'whiteArtwork' | 'whiteArtworkPendulum' | 'whiteArtworkPendulumLink';
type TPendOrNot = 'regular' | 'pendulum';
type TLinkOrNot = 'regular' | 'link';
type TLanguageOrVanilla = TCardLanguage | 'vanilla';
type TLevelKind = 'level' | 'negativeLevel' | 'rank' | 'linkRating';
type TScaleSide = 'left' | 'right';
type TStType =
  | 'normalSpell'
  | 'normalTrap'
  | 'ritual'
  | 'quickplay'
  | 'field'
  | 'continuous'
  | 'equip'
  | 'counter'
  | 'link'
  | 'spellPlus'
  | 'trapPlus';
type TCopyrightYear = '1996' | '2020';
type TCopyrightColor = 'black' | 'white';
type TLimitation = TEdition | 'copyright';
interface IMasterPaths {
  placeholder: string;
  border: string;
  atkDefLine: string;
  atkLinkLine: string;
  whiteArtworks: { [key in TWhiteArtwork]: string };
  frames: { [key in TFrame]: string };
  attributes: { [key in TLanguageOrVanilla]: { [attribute in TAttribute]: string } };
  attributeIcons: { [attribute in TAttribute]: string };
  levels: { [levelKind in TLevelKind]: { [level: number]: string } };
  spellTraps: { [language in TCardLanguage]: { [stType in TStType]: string } };
  stIcons: { [attribute in TStIcon]: string };
  scales: { [key in TLinkOrNot]: { [side in TScaleSide]: { [scale: number]: string } } };
  pendFrames: { [key in TLinkOrNot]: string };
  pendCovers: { [key in TFrame]: string };
  linkArrows: { [key in TPendOrNot]: ICardLinkArrowPaths };
  stickers: { [sticket in TSticker]: string };
  limitations: {
    [language in TCardLanguage]: {
      [year in TCopyrightYear]: {
        [color in TCopyrightColor]: {
          [limitation in TLimitation]: string;
        };
      };
    };
  };
}

type TRushLevelKind = 'level' | 'rank';
interface IRushPaths {
  placeholder: string;
  atkDefLine: string;
  atkMaxLine: string;
  whiteArtwork: string;
  frames: { [key in TFrame]: string };
  legends: { [key in TLegendType]: string };
  attributes: { [key in TCardLanguage]: { [attribute in TAttribute]: string } };
  attributeIcons: { [attribute in TAttribute]: string };
  levelStars: { [levelKind in TRushLevelKind]: string };
  levels: { [levelKind in TRushLevelKind]: { [level: number]: string } };
  spellTraps: { [stType in TStIcon]: string };
  stickers: { [sticket in TSticker]: string };
  limitations: {
    [language in TCardLanguage]: {
      [year in TCopyrightYear]: {
        [limitation in TLimitation]: string;
      };
    };
  };
}

export class CardService extends AbstractObservable<ICardListener> implements Partial<IStoreListener> {
  private _paths: { master: IMasterPaths; rush: IRushPaths };
  public get paths() {
    return this._paths;
  }
  private _currentCard;
  public get currentCard() {
    return this._currentCard;
  }
  private _tempCurrentCard?: ICard;
  public get tempCurrentCard() {
    return this._tempCurrentCard;
  }
  private _localCards: ICard[];
  public get localCards() {
    return this._localCards;
  }
  private _renderCard?: ICard;
  private _renderCardsQueue: ICard[];
  private _renderPath?: string;

  public constructor() {
    super();
    app.$store.addListener(this);

    this._paths = {
      master: {
        placeholder: require('assets/images/cardPlaceholder.png'),
        border: require('assets/images/squareBorders.png'),
        atkDefLine: require('assets/images/atkDefLine.png'),
        atkLinkLine: require('assets/images/atkLinkLine.png'),
        whiteArtworks: {
          whiteArtwork: require('assets/images/whiteArtwork.png'),
          whiteArtworkPendulum: require('assets/images/whiteArtworkPendulum.png'),
          whiteArtworkPendulumLink: require('assets/images/whiteArtworkPendulumLink.png'),
        },
        frames: {
          normal: require('assets/images/card-frames/normal.png'),
          effect: require('assets/images/card-frames/effect.png'),
          ritual: require('assets/images/card-frames/ritual.png'),
          fusion: require('assets/images/card-frames/fusion.png'),
          synchro: require('assets/images/card-frames/synchro.png'),
          darkSynchro: require('assets/images/card-frames/darkSynchro.png'),
          xyz: require('assets/images/card-frames/xyz.png'),
          link: require('assets/images/card-frames/link.png'),
          spell: require('assets/images/card-frames/spell.png'),
          trap: require('assets/images/card-frames/trap.png'),
          legendaryDragon: require('assets/images/card-frames/legendaryDragon.png'),
          obelisk: require('assets/images/card-frames/obelisk.png'),
          slifer: require('assets/images/card-frames/slifer.png'),
          ra: require('assets/images/card-frames/ra.png'),
          token: require('assets/images/card-frames/token.png'),
          monsterToken: require('assets/images/card-frames/monsterToken.png'),
          skill: require('assets/images/card-frames/skill.png'),
        },
        attributes: {
          fr: {
            dark: require('assets/images/attributes/fr/dark.png'),
            light: require('assets/images/attributes/fr/light.png'),
            water: require('assets/images/attributes/fr/water.png'),
            earth: require('assets/images/attributes/fr/earth.png'),
            wind: require('assets/images/attributes/fr/wind.png'),
            fire: require('assets/images/attributes/fr/fire.png'),
            divine: require('assets/images/attributes/fr/divine.png'),
            spell: require('assets/images/attributes/fr/spell.png'),
            trap: require('assets/images/attributes/fr/trap.png'),
          },
          en: {
            dark: require('assets/images/attributes/en/dark.png'),
            light: require('assets/images/attributes/en/light.png'),
            water: require('assets/images/attributes/en/water.png'),
            earth: require('assets/images/attributes/en/earth.png'),
            wind: require('assets/images/attributes/en/wind.png'),
            fire: require('assets/images/attributes/en/fire.png'),
            divine: require('assets/images/attributes/en/divine.png'),
            spell: require('assets/images/attributes/en/spell.png'),
            trap: require('assets/images/attributes/en/trap.png'),
          },
          vanilla: {
            dark: require('assets/images/attributes/vanilla/dark.png'),
            light: require('assets/images/attributes/vanilla/light.png'),
            water: require('assets/images/attributes/vanilla/water.png'),
            earth: require('assets/images/attributes/vanilla/earth.png'),
            wind: require('assets/images/attributes/vanilla/wind.png'),
            fire: require('assets/images/attributes/vanilla/fire.png'),
            divine: require('assets/images/attributes/vanilla/divine.png'),
            spell: require('assets/images/attributes/vanilla/spell.png'),
            trap: require('assets/images/attributes/vanilla/trap.png'),
          },
        },
        attributeIcons: {
          dark: require('assets/images/icons/vanilla/attributeDark.png'),
          light: require('assets/images/icons/vanilla/attributeLight.png'),
          water: require('assets/images/icons/vanilla/attributeWater.png'),
          earth: require('assets/images/icons/vanilla/attributeEarth.png'),
          wind: require('assets/images/icons/vanilla/attributeWind.png'),
          fire: require('assets/images/icons/vanilla/attributeFire.png'),
          divine: require('assets/images/icons/vanilla/attributeDivine.png'),
          spell: require('assets/images/icons/vanilla/attributeSpell.png'),
          trap: require('assets/images/icons/vanilla/attributeTrap.png'),
        },
        levels: {
          level: {
            0: require('assets/images/levels/0.png'),
            1: require('assets/images/levels/1.png'),
            2: require('assets/images/levels/2.png'),
            3: require('assets/images/levels/3.png'),
            4: require('assets/images/levels/4.png'),
            5: require('assets/images/levels/5.png'),
            6: require('assets/images/levels/6.png'),
            7: require('assets/images/levels/7.png'),
            8: require('assets/images/levels/8.png'),
            9: require('assets/images/levels/9.png'),
            10: require('assets/images/levels/10.png'),
            11: require('assets/images/levels/11.png'),
            12: require('assets/images/levels/12.png'),
            13: require('assets/images/levels/13.png'),
          },
          negativeLevel: {
            0: require('assets/images/negative-levels/0.png'),
            1: require('assets/images/negative-levels/1.png'),
            2: require('assets/images/negative-levels/2.png'),
            3: require('assets/images/negative-levels/3.png'),
            4: require('assets/images/negative-levels/4.png'),
            5: require('assets/images/negative-levels/5.png'),
            6: require('assets/images/negative-levels/6.png'),
            7: require('assets/images/negative-levels/7.png'),
            8: require('assets/images/negative-levels/8.png'),
            9: require('assets/images/negative-levels/9.png'),
            10: require('assets/images/negative-levels/10.png'),
            11: require('assets/images/negative-levels/11.png'),
            12: require('assets/images/negative-levels/12.png'),
            13: require('assets/images/negative-levels/13.png'),
          },
          rank: {
            0: require('assets/images/ranks/0.png'),
            1: require('assets/images/ranks/1.png'),
            2: require('assets/images/ranks/2.png'),
            3: require('assets/images/ranks/3.png'),
            4: require('assets/images/ranks/4.png'),
            5: require('assets/images/ranks/5.png'),
            6: require('assets/images/ranks/6.png'),
            7: require('assets/images/ranks/7.png'),
            8: require('assets/images/ranks/8.png'),
            9: require('assets/images/ranks/9.png'),
            10: require('assets/images/ranks/10.png'),
            11: require('assets/images/ranks/11.png'),
            12: require('assets/images/ranks/12.png'),
            13: require('assets/images/ranks/13.png'),
          },
          linkRating: {
            0: require('assets/images/link-ratings/0.png'),
            1: require('assets/images/link-ratings/1.png'),
            2: require('assets/images/link-ratings/2.png'),
            3: require('assets/images/link-ratings/3.png'),
            4: require('assets/images/link-ratings/4.png'),
            5: require('assets/images/link-ratings/5.png'),
            6: require('assets/images/link-ratings/6.png'),
            7: require('assets/images/link-ratings/7.png'),
            8: require('assets/images/link-ratings/8.png'),
            9: require('assets/images/link-ratings/9.png'),
            10: require('assets/images/link-ratings/10.png'),
            11: require('assets/images/link-ratings/11.png'),
            12: require('assets/images/link-ratings/12.png'),
            13: require('assets/images/link-ratings/13.png'),
          },
        },
        spellTraps: {
          fr: {
            normalSpell: require('assets/images/st/fr/normal-spell.png'),
            normalTrap: require('assets/images/st/fr/normal-trap.png'),
            ritual: require('assets/images/st/fr/ritual.png'),
            quickplay: require('assets/images/st/fr/quickplay.png'),
            field: require('assets/images/st/fr/field.png'),
            continuous: require('assets/images/st/fr/continuous.png'),
            equip: require('assets/images/st/fr/equip.png'),
            counter: require('assets/images/st/fr/counter.png'),
            link: require('assets/images/st/fr/link.png'),
            spellPlus: require('assets/images/st/fr/spell+.png'),
            trapPlus: require('assets/images/st/fr/trap+.png'),
          },
          en: {
            normalSpell: require('assets/images/st/en/normal-spell.png'),
            normalTrap: require('assets/images/st/en/normal-trap.png'),
            ritual: require('assets/images/st/en/ritual.png'),
            quickplay: require('assets/images/st/en/quickplay.png'),
            field: require('assets/images/st/en/field.png'),
            continuous: require('assets/images/st/en/continuous.png'),
            equip: require('assets/images/st/en/equip.png'),
            counter: require('assets/images/st/en/counter.png'),
            link: require('assets/images/st/en/link.png'),
            spellPlus: require('assets/images/st/en/spell+.png'),
            trapPlus: require('assets/images/st/en/trap+.png'),
          },
        },
        stIcons: {
          normal: require(`assets/images/icons/st/normal.png`),
          ritual: require(`assets/images/icons/st/ritual.png`),
          quickplay: require(`assets/images/icons/st/quickplay.png`),
          continuous: require(`assets/images/icons/st/continuous.png`),
          equip: require(`assets/images/icons/st/equip.png`),
          field: require(`assets/images/icons/st/field.png`),
          counter: require(`assets/images/icons/st/counter.png`),
          link: require(`assets/images/icons/st/link.png`),
        },
        scales: {
          regular: {
            left: {
              0: require('assets/images/pendulum-scales/G_0.png'),
              1: require('assets/images/pendulum-scales/G_1.png'),
              2: require('assets/images/pendulum-scales/G_2.png'),
              3: require('assets/images/pendulum-scales/G_3.png'),
              4: require('assets/images/pendulum-scales/G_4.png'),
              5: require('assets/images/pendulum-scales/G_5.png'),
              6: require('assets/images/pendulum-scales/G_6.png'),
              7: require('assets/images/pendulum-scales/G_7.png'),
              8: require('assets/images/pendulum-scales/G_8.png'),
              9: require('assets/images/pendulum-scales/G_9.png'),
              10: require('assets/images/pendulum-scales/G_10.png'),
              11: require('assets/images/pendulum-scales/G_11.png'),
              12: require('assets/images/pendulum-scales/G_12.png'),
              13: require('assets/images/pendulum-scales/G_13.png'),
              14: require('assets/images/pendulum-scales/G_14.png'),
            },
            right: {
              0: require('assets/images/pendulum-scales/D_0.png'),
              1: require('assets/images/pendulum-scales/D_1.png'),
              2: require('assets/images/pendulum-scales/D_2.png'),
              3: require('assets/images/pendulum-scales/D_3.png'),
              4: require('assets/images/pendulum-scales/D_4.png'),
              5: require('assets/images/pendulum-scales/D_5.png'),
              6: require('assets/images/pendulum-scales/D_6.png'),
              7: require('assets/images/pendulum-scales/D_7.png'),
              8: require('assets/images/pendulum-scales/D_8.png'),
              9: require('assets/images/pendulum-scales/D_9.png'),
              10: require('assets/images/pendulum-scales/D_10.png'),
              11: require('assets/images/pendulum-scales/D_11.png'),
              12: require('assets/images/pendulum-scales/D_12.png'),
              13: require('assets/images/pendulum-scales/D_13.png'),
              14: require('assets/images/pendulum-scales/D_14.png'),
            },
          },
          link: {
            left: {
              0: require('assets/images/pendulum-scales/L_G_0.png'),
              1: require('assets/images/pendulum-scales/L_G_1.png'),
              2: require('assets/images/pendulum-scales/L_G_2.png'),
              3: require('assets/images/pendulum-scales/L_G_3.png'),
              4: require('assets/images/pendulum-scales/L_G_4.png'),
              5: require('assets/images/pendulum-scales/L_G_5.png'),
              6: require('assets/images/pendulum-scales/L_G_6.png'),
              7: require('assets/images/pendulum-scales/L_G_7.png'),
              8: require('assets/images/pendulum-scales/L_G_8.png'),
              9: require('assets/images/pendulum-scales/L_G_9.png'),
              10: require('assets/images/pendulum-scales/L_G_10.png'),
              11: require('assets/images/pendulum-scales/L_G_11.png'),
              12: require('assets/images/pendulum-scales/L_G_12.png'),
              13: require('assets/images/pendulum-scales/L_G_13.png'),
              14: require('assets/images/pendulum-scales/L_G_14.png'),
            },
            right: {
              0: require('assets/images/pendulum-scales/L_D_0.png'),
              1: require('assets/images/pendulum-scales/L_D_1.png'),
              2: require('assets/images/pendulum-scales/L_D_2.png'),
              3: require('assets/images/pendulum-scales/L_D_3.png'),
              4: require('assets/images/pendulum-scales/L_D_4.png'),
              5: require('assets/images/pendulum-scales/L_D_5.png'),
              6: require('assets/images/pendulum-scales/L_D_6.png'),
              7: require('assets/images/pendulum-scales/L_D_7.png'),
              8: require('assets/images/pendulum-scales/L_D_8.png'),
              9: require('assets/images/pendulum-scales/L_D_9.png'),
              10: require('assets/images/pendulum-scales/L_D_10.png'),
              11: require('assets/images/pendulum-scales/L_D_11.png'),
              12: require('assets/images/pendulum-scales/L_D_12.png'),
              13: require('assets/images/pendulum-scales/L_D_13.png'),
              14: require('assets/images/pendulum-scales/L_D_14.png'),
            },
          },
        },
        pendFrames: {
          regular: require('assets/images/pendulum-frames/regular.png'),
          link: require('assets/images/pendulum-frames/link.png'),
        },
        pendCovers: {
          normal: require('assets/images/pendulum-covers/normal.png'),
          effect: require('assets/images/pendulum-covers/effect.png'),
          ritual: require('assets/images/pendulum-covers/ritual.png'),
          fusion: require('assets/images/pendulum-covers/fusion.png'),
          synchro: require('assets/images/pendulum-covers/synchro.png'),
          darkSynchro: require('assets/images/pendulum-covers/darkSynchro.png'),
          xyz: require('assets/images/pendulum-covers/xyz.png'),
          link: require('assets/images/pendulum-covers/link.png'),
          monsterToken: require('assets/images/pendulum-covers/monsterToken.png'),
          obelisk: require('assets/images/pendulum-covers/obelisk.png'),
          slifer: require('assets/images/pendulum-covers/slifer.png'),
          ra: require('assets/images/pendulum-covers/ra.png'),
          spell: '',
          trap: '',
          legendaryDragon: '',
          token: '',
          skill: '',
        },
        linkArrows: {
          regular: {
            top: require('assets/images/link-arrows/top.png'),
            bottom: require('assets/images/link-arrows/bottom.png'),
            left: require('assets/images/link-arrows/left.png'),
            right: require('assets/images/link-arrows/right.png'),
            topLeft: require('assets/images/link-arrows/topLeft.png'),
            topRight: require('assets/images/link-arrows/topRight.png'),
            bottomLeft: require('assets/images/link-arrows/bottomLeft.png'),
            bottomRight: require('assets/images/link-arrows/bottomRight.png'),
          },
          pendulum: {
            top: require('assets/images/link-arrows/topPendulum.png'),
            bottom: require('assets/images/link-arrows/bottomPendulum.png'),
            left: require('assets/images/link-arrows/leftPendulum.png'),
            right: require('assets/images/link-arrows/rightPendulum.png'),
            topLeft: require('assets/images/link-arrows/topLeftPendulum.png'),
            topRight: require('assets/images/link-arrows/topRightPendulum.png'),
            bottomLeft: require('assets/images/link-arrows/bottomLeftPendulum.png'),
            bottomRight: require('assets/images/link-arrows/bottomRightPendulum.png'),
          },
        },
        stickers: {
          none: '',
          silver: require('assets/images/stickers/silver.png'),
          gold: require('assets/images/stickers/gold.png'),
          grey: require('assets/images/stickers/grey.png'),
          white: require('assets/images/stickers/white.png'),
          lightBlue: require('assets/images/stickers/lightBlue.png'),
          skyBlue: require('assets/images/stickers/skyBlue.png'),
          cyan: require('assets/images/stickers/cyan.png'),
          aqua: require('assets/images/stickers/aqua.png'),
          green: require('assets/images/stickers/green.png'),
        },
        limitations: {
          fr: {
            '1996': {
              black: {
                unlimited: '',
                limited: require('assets/images/limitations/fr/1996/black/limited.png'),
                forbidden: require('assets/images/limitations/fr/1996/black/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/fr/1996/black/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/fr/1996/black/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/fr/1996/black/duelTerminal.png'),
                anime: require('assets/images/limitations/fr/1996/black/anime.png'),
                copyright: require('assets/images/limitations/fr/1996/black/copyright.png'),
              },
              white: {
                unlimited: '',
                limited: require('assets/images/limitations/fr/1996/white/limited.png'),
                forbidden: require('assets/images/limitations/fr/1996/white/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/fr/1996/white/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/fr/1996/white/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/fr/1996/white/duelTerminal.png'),
                anime: require('assets/images/limitations/fr/1996/white/anime.png'),
                copyright: require('assets/images/limitations/fr/1996/white/copyright.png'),
              },
            },
            '2020': {
              black: {
                unlimited: '',
                limited: require('assets/images/limitations/fr/2020/black/limited.png'),
                forbidden: require('assets/images/limitations/fr/2020/black/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/fr/2020/black/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/fr/2020/black/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/fr/2020/black/duelTerminal.png'),
                anime: require('assets/images/limitations/fr/2020/black/anime.png'),
                copyright: require('assets/images/limitations/fr/2020/black/copyright.png'),
              },
              white: {
                unlimited: '',
                limited: require('assets/images/limitations/fr/2020/white/limited.png'),
                forbidden: require('assets/images/limitations/fr/2020/white/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/fr/2020/white/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/fr/2020/white/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/fr/2020/white/duelTerminal.png'),
                anime: require('assets/images/limitations/fr/2020/white/anime.png'),
                copyright: require('assets/images/limitations/fr/2020/white/copyright.png'),
              },
            },
          },
          en: {
            '1996': {
              black: {
                unlimited: '',
                limited: require('assets/images/limitations/en/1996/black/limited.png'),
                forbidden: require('assets/images/limitations/en/1996/black/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/en/1996/black/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/en/1996/black/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/en/1996/black/duelTerminal.png'),
                anime: require('assets/images/limitations/en/1996/black/anime.png'),
                copyright: require('assets/images/limitations/en/1996/black/copyright.png'),
              },
              white: {
                unlimited: '',
                limited: require('assets/images/limitations/en/1996/white/limited.png'),
                forbidden: require('assets/images/limitations/en/1996/white/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/en/1996/white/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/en/1996/white/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/en/1996/white/duelTerminal.png'),
                anime: require('assets/images/limitations/en/1996/white/anime.png'),
                copyright: require('assets/images/limitations/en/1996/white/copyright.png'),
              },
            },
            '2020': {
              black: {
                unlimited: '',
                limited: require('assets/images/limitations/en/2020/black/limited.png'),
                forbidden: require('assets/images/limitations/en/2020/black/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/en/2020/black/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/en/2020/black/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/en/2020/black/duelTerminal.png'),
                anime: require('assets/images/limitations/en/2020/black/anime.png'),
                copyright: require('assets/images/limitations/en/2020/black/copyright.png'),
              },
              white: {
                unlimited: '',
                limited: require('assets/images/limitations/en/2020/white/limited.png'),
                forbidden: require('assets/images/limitations/en/2020/white/forbidden.png'),
                forbiddenDeck: require('assets/images/limitations/en/2020/white/forbiddenDeck.png'),
                firstEdition: require('assets/images/limitations/en/2020/white/firstEdition.png'),
                duelTerminal: require('assets/images/limitations/en/2020/white/duelTerminal.png'),
                anime: require('assets/images/limitations/en/2020/white/anime.png'),
                copyright: require('assets/images/limitations/en/2020/white/copyright.png'),
              },
            },
          },
        },
      },
      rush: {
        placeholder: require('assets/images/rdCardPlaceholder.png'),
        atkDefLine: require('assets/images/rdAtkDefLine.png'),
        atkMaxLine: require('assets/images/rdAtkMaxLine.png'),
        whiteArtwork: require('assets/images/rdWhiteArtwork.png'),
        frames: {
          normal: require('assets/images/rd-card-frames/normal.png'),
          effect: require('assets/images/rd-card-frames/effect.png'),
          ritual: require('assets/images/rd-card-frames/ritual.png'),
          fusion: require('assets/images/rd-card-frames/fusion.png'),
          synchro: require('assets/images/rd-card-frames/synchro.png'),
          xyz: require('assets/images/rd-card-frames/xyz.png'),
          spell: require('assets/images/rd-card-frames/spell.png'),
          trap: require('assets/images/rd-card-frames/trap.png'),
          token: require('assets/images/rd-card-frames/token.png'),
          monsterToken: require('assets/images/rd-card-frames/monsterToken.png'),
          darkSynchro: '',
          link: '',
          legendaryDragon: '',
          obelisk: '',
          slifer: '',
          ra: '',
          skill: '',
        },
        legends: {
          silver: require('assets/images/rd-legend/silver.png'),
          gold: require('assets/images/rd-legend/gold.png'),
          goldFoil: require('assets/images/rd-legend/goldFoil.png'),
          silverFoil: require('assets/images/rd-legend/silverFoil.png'),
        },
        attributes: {
          fr: {
            dark: require('assets/images/rd-attributes/fr/dark.png'),
            light: require('assets/images/rd-attributes/fr/light.png'),
            water: require('assets/images/rd-attributes/fr/water.png'),
            earth: require('assets/images/rd-attributes/fr/earth.png'),
            wind: require('assets/images/rd-attributes/fr/wind.png'),
            fire: require('assets/images/rd-attributes/fr/fire.png'),
            spell: require('assets/images/rd-attributes/fr/spell.png'),
            trap: require('assets/images/rd-attributes/fr/trap.png'),
            divine: '',
          },
          en: {
            dark: require('assets/images/rd-attributes/en/dark.png'),
            light: require('assets/images/rd-attributes/en/light.png'),
            water: require('assets/images/rd-attributes/en/water.png'),
            earth: require('assets/images/rd-attributes/en/earth.png'),
            wind: require('assets/images/rd-attributes/en/wind.png'),
            fire: require('assets/images/rd-attributes/en/fire.png'),
            spell: require('assets/images/rd-attributes/en/spell.png'),
            trap: require('assets/images/rd-attributes/en/trap.png'),
            divine: '',
          },
        },
        attributeIcons: {
          dark: require('assets/images/rd-icons/vanilla/attributeDark.png'),
          light: require('assets/images/rd-icons/vanilla/attributeLight.png'),
          water: require('assets/images/rd-icons/vanilla/attributeWater.png'),
          earth: require('assets/images/rd-icons/vanilla/attributeEarth.png'),
          wind: require('assets/images/rd-icons/vanilla/attributeWind.png'),
          fire: require('assets/images/rd-icons/vanilla/attributeFire.png'),
          spell: require('assets/images/rd-icons/vanilla/attributeSpell.png'),
          trap: require('assets/images/rd-icons/vanilla/attributeTrap.png'),
          divine: '',
        },
        levelStars: {
          level: require('assets/images/rd-levels/star.png'),
          rank: require('assets/images/rd-ranks/star.png'),
        },
        levels: {
          level: {
            0: require('assets/images/rd-levels/0.png'),
            1: require('assets/images/rd-levels/1.png'),
            2: require('assets/images/rd-levels/2.png'),
            3: require('assets/images/rd-levels/3.png'),
            4: require('assets/images/rd-levels/4.png'),
            5: require('assets/images/rd-levels/5.png'),
            6: require('assets/images/rd-levels/6.png'),
            7: require('assets/images/rd-levels/7.png'),
            8: require('assets/images/rd-levels/8.png'),
            9: require('assets/images/rd-levels/9.png'),
            10: require('assets/images/rd-levels/10.png'),
            11: require('assets/images/rd-levels/11.png'),
            12: require('assets/images/rd-levels/12.png'),
            13: require('assets/images/rd-levels/13.png'),
          },
          rank: {
            0: require('assets/images/rd-ranks/0.png'),
            1: require('assets/images/rd-ranks/1.png'),
            2: require('assets/images/rd-ranks/2.png'),
            3: require('assets/images/rd-ranks/3.png'),
            4: require('assets/images/rd-ranks/4.png'),
            5: require('assets/images/rd-ranks/5.png'),
            6: require('assets/images/rd-ranks/6.png'),
            7: require('assets/images/rd-ranks/7.png'),
            8: require('assets/images/rd-ranks/8.png'),
            9: require('assets/images/rd-ranks/9.png'),
            10: require('assets/images/rd-ranks/10.png'),
            11: require('assets/images/rd-ranks/11.png'),
            12: require('assets/images/rd-ranks/12.png'),
            13: require('assets/images/rd-ranks/13.png'),
          },
        },
        spellTraps: {
          normal: require('assets/images/rd-icons/st/normal.png'),
          ritual: require('assets/images/rd-icons/st/ritual.png'),
          quickplay: require('assets/images/rd-icons/st/quickplay.png'),
          field: require('assets/images/rd-icons/st/field.png'),
          continuous: require('assets/images/rd-icons/st/continuous.png'),
          equip: require('assets/images/rd-icons/st/equip.png'),
          counter: require('assets/images/rd-icons/st/counter.png'),
          link: '',
        },
        stickers: {
          none: '',
          silver: require('assets/images/rd-stickers/silver.png'),
          gold: require('assets/images/rd-stickers/gold.png'),
          grey: require('assets/images/rd-stickers/grey.png'),
          white: require('assets/images/rd-stickers/white.png'),
          lightBlue: require('assets/images/rd-stickers/lightBlue.png'),
          skyBlue: require('assets/images/rd-stickers/skyBlue.png'),
          cyan: require('assets/images/rd-stickers/cyan.png'),
          aqua: require('assets/images/rd-stickers/aqua.png'),
          green: require('assets/images/rd-stickers/green.png'),
        },
        limitations: {
          fr: {
            '1996': {
              unlimited: '',
              limited: require('assets/images/rd-limitations/fr/1996/limited.png'),
              forbidden: require('assets/images/rd-limitations/fr/1996/forbidden.png'),
              forbiddenDeck: require('assets/images/rd-limitations/fr/1996/forbiddenDeck.png'),
              firstEdition: require('assets/images/rd-limitations/fr/1996/firstEdition.png'),
              duelTerminal: require('assets/images/rd-limitations/fr/1996/duelTerminal.png'),
              anime: require('assets/images/rd-limitations/fr/1996/anime.png'),
              copyright: require('assets/images/rd-limitations/fr/1996/copyright.png'),
            },
            '2020': {
              unlimited: '',
              limited: require('assets/images/rd-limitations/fr/2020/limited.png'),
              forbidden: require('assets/images/rd-limitations/fr/2020/forbidden.png'),
              forbiddenDeck: require('assets/images/rd-limitations/fr/2020/forbiddenDeck.png'),
              firstEdition: require('assets/images/rd-limitations/fr/2020/firstEdition.png'),
              duelTerminal: require('assets/images/rd-limitations/fr/2020/duelTerminal.png'),
              anime: require('assets/images/rd-limitations/fr/2020/anime.png'),
              copyright: require('assets/images/rd-limitations/fr/2020/copyright.png'),
            },
          },
          en: {
            '1996': {
              unlimited: '',
              limited: require('assets/images/rd-limitations/en/1996/limited.png'),
              forbidden: require('assets/images/rd-limitations/en/1996/forbidden.png'),
              forbiddenDeck: require('assets/images/rd-limitations/en/1996/forbiddenDeck.png'),
              firstEdition: require('assets/images/rd-limitations/en/1996/firstEdition.png'),
              duelTerminal: require('assets/images/rd-limitations/en/1996/duelTerminal.png'),
              anime: require('assets/images/rd-limitations/en/1996/anime.png'),
              copyright: require('assets/images/rd-limitations/en/1996/copyright.png'),
            },
            '2020': {
              unlimited: '',
              limited: require('assets/images/rd-limitations/en/2020/limited.png'),
              forbidden: require('assets/images/rd-limitations/en/2020/forbidden.png'),
              forbiddenDeck: require('assets/images/rd-limitations/en/2020/forbiddenDeck.png'),
              firstEdition: require('assets/images/rd-limitations/en/2020/firstEdition.png'),
              duelTerminal: require('assets/images/rd-limitations/en/2020/duelTerminal.png'),
              anime: require('assets/images/rd-limitations/en/2020/anime.png'),
              copyright: require('assets/images/rd-limitations/en/2020/copyright.png'),
            },
          },
        },
      },
    };

    this._currentCard = {} as ICard;
    this._localCards = [];
    this._renderCardsQueue = [];

    app.$errorManager.handlePromise(this.load(true));
  }

  public async setup() {
    if (app.$device.isElectron(window)) {
      window.electron.ipcRenderer.addListener('renderCurrentCard', () =>
        app.$errorManager.handlePromise(app.$card.renderCurrentCard())
      );

      window.electron.ipcRenderer.addListener('saveCurrentOrTempToLocal', () =>
        app.$errorManager.handlePromise(app.$card.saveCurrentOrTempToLocal())
      );

      window.electron.ipcRenderer.addListener('importCards', () =>
        app.$errorManager.handlePromise(app.$card.showImportDialog())
      );
    }
    return Promise.resolve();
  }

  public cleared() {
    app.$errorManager.handlePromise(this.load(false));
  }

  public correct(card: Partial<ICard>) {
    card.language = card.language || 'fr';
    card.name = card.name || '';
    card.nameStyle = card.nameStyle || 'default';
    card.tcgAt = card.tcgAt || false;
    card.artwork = card.artwork || {
      url: '',
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      pendulum: false,
      keepRatio: false,
    };
    card.frames = card.frames || ['effect'];
    card.multipleFrames = card.multipleFrames || false;
    card.stType = card.stType || 'normal';
    card.attribute = card.attribute || 'spell';
    card.abilities = card.abilities || [];
    card.noTextAttribute = card.noTextAttribute || false;
    card.level = card.level || 0;
    card.atk = card.atk || '';
    card.def = card.def || '';
    card.description = card.description || '';
    card.pendulum = card.pendulum || false;
    card.pendEffect = card.pendEffect || '';
    card.scales = card.scales || {
      left: 0,
      right: 0,
    };
    card.linkArrows = card.linkArrows || {
      top: false,
      bottom: false,
      left: false,
      right: false,
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    };
    card.edition = card.edition || 'firstEdition';
    card.cardSet = card.cardSet || '';
    card.passcode = card.passcode || '';
    card.sticker = card.sticker || 'silver';
    card.hasCopyright = card.hasCopyright || false;
    card.oldCopyright = card.oldCopyright || false;
    card.speed = card.speed || false;
    card.rush = card.rush || false;
    card.dontCoverRushArt = card.dontCoverRushArt || false;
    card.rushTextMode = card.rushTextMode || 'regular';
    card.rushOtherEffects = card.rushOtherEffects || '';
    card.rushCondition = card.rushCondition || '';
    card.rushEffect = card.rushEffect || '';

    if (!card.rushChoiceEffects?.length) {
      card.rushChoiceEffects = ['', ''];
    } else if (card.rushChoiceEffects.length === 1) {
      card.rushChoiceEffects = [card.rushChoiceEffects[0]!, ''];
    }

    card.rushEffectType = card.rushEffectType || 'effect';
    card.legend = card.legend || false;
    card.legendType = card.legendType || 'gold';
    card.atkMax = typeof card.atkMax === 'number' ? '' : card.atkMax || '';
    card.maximum = card.maximum || false;

    return card as ICard;
  }

  private async load(initial: boolean) {
    this._localCards = await app.$store.get<ICard[], TCardStorageKey>('local-cards', []);
    if (this._localCards.length) {
      for (let localCard of this._localCards) {
        this.correct(localCard);
      }
      await app.$store.set<ICard[], TCardStorageKey>('local-cards', this._localCards);
    } else {
      this._localCards = [];
    }

    this._tempCurrentCard = await app.$store.get<ICard, TCardStorageKey>('temp-current-card');
    if (this._tempCurrentCard) {
      this.correct(this._tempCurrentCard);
      await app.$store.set<ICard, TCardStorageKey>('temp-current-card', this._tempCurrentCard);
    }

    const currentCard = await app.$store.get<ICard, TCardStorageKey>('current-card');
    if (currentCard) {
      this._currentCard = currentCard;
      this.correct(this._currentCard);
    } else {
      this._currentCard = this.getDefaultCurrentCard();
    }
    await app.$store.set<ICard, TCardStorageKey>('current-card', this._currentCard);

    if (initial) {
      this.dispatch('localCardsLoaded', this.localCards);
      this.dispatch('currentCardLoaded', this.currentCard);
      this.dispatch('tempCurrentCardLoaded', this.tempCurrentCard);
    } else {
      this.dispatch('localCardsUpdated', this.localCards);
      this.dispatch('currentCardUpdated', this.currentCard);
      this.dispatch('tempCurrentCardUpdated', this.tempCurrentCard);
    }
  }

  public get exportCardData(): ICardsExportData {
    return {
      'current-card': this._currentCard,
      'temp-current-card': this._tempCurrentCard as ICard,
      'local-cards': this._localCards,
    };
  }

  public async importCardData(data: ICardsExportData) {
    if (data['local-cards']) {
      this._localCards = deepClone(data['local-cards']);
      if (this._localCards?.length) {
        for (const localCard of this._localCards) {
          this.correct(localCard);
        }
      }
      await app.$store.set<ICard[], TCardStorageKey>('local-cards', this._localCards);
      this.dispatch('localCardsUpdated', this.localCards);
    }

    if (data['current-card']) {
      this._currentCard = deepClone(data['current-card']);
      if (this._currentCard) {
        this.correct(this._currentCard);
      }
      await app.$store.set<ICard, TCardStorageKey>('current-card', this._currentCard);
      this.dispatch('currentCardUpdated', this.currentCard);
    }

    if (data['temp-current-card']) {
      this._tempCurrentCard = deepClone(data['temp-current-card']);
      if (this._tempCurrentCard) {
        this.correct(this._tempCurrentCard);
      }
      await app.$store.set<ICard, TCardStorageKey>('temp-current-card', this._tempCurrentCard);
      this.dispatch('tempCurrentCardUpdated', this.tempCurrentCard);
    }
  }

  public async renderCurrentCard() {
    const card = this._tempCurrentCard || this._currentCard;
    const element = document.getElementById('main-card-builder') as HTMLDivElement;
    if (!element) return;
    await this.askRenderPath();
    await this.writeCardFile(element, card);
  }

  private setRenderCard() {
    this._renderCard = this._renderCardsQueue[0];
    this.dispatch('renderCardChanged', this._renderCard);
  }

  public async askRenderPath() {
    if (!app.$device.isElectron(window)) return;
    this._renderPath = await window.electron.ipcRenderer.invoke(
      'getDirectoryPath',
      app.$settings.settings.defaultRenderPath
    );
  }

  public async renderCards(cards: ICard[]) {
    if (!cards?.length || !app.$device.isElectron(window)) return;

    await this.askRenderPath();
    if (!this._renderPath) return;

    this._renderCardsQueue.push(...cards);
    this.setRenderCard();
  }

  public async writeCardFile(element: HTMLDivElement, card: ICard) {
    if (!app.$device.isElectron(window) || !this._renderPath) return;

    try {
      const dataUrl = await toPng(element);
      if (!dataUrl) throw new Error(`No data URL for card ${card.uuid || card.name}`);
      await window.electron.ipcRenderer.invoke(
        'writePngFile',
        sanitizeFileName(card.name || 'Sans nom'),
        dataUrl.replace(/^data:image\/\w+;base64,/, ''),
        this._renderPath
      );
    } catch (error) {
      console.error(error);
    }

    if (!this._renderCardsQueue.length) return;

    this._renderCardsQueue = this._renderCardsQueue.filter((c) => c.uuid !== card.uuid);
    this.dispatch('cardRenderer', card);
    if (this._renderCardsQueue.length) this.setRenderCard();
  }

  public async resetCurrentCard() {
    this._currentCard = this.getDefaultCurrentCard();
    await app.$store.set<ICard, TCardStorageKey>('current-card', this._currentCard);
    this.dispatch('currentCardUpdated', this.currentCard);
  }

  public async convertCurrentCard() {
    if (!this._currentCard) return;
    this._currentCard = this.convertCard(this._currentCard);
    await this.saveCurrentCard(this._currentCard);
  }

  public async convertTempCurrentCard() {
    if (!this._tempCurrentCard) return;
    this._tempCurrentCard = this.convertCard(this._tempCurrentCard);
    await this.saveTempCurrentCard(this._tempCurrentCard);
  }

  private convertCard(card: ICard) {
    if (card.rush) {
      card.rush = false;
      return card;
    } else {
      card.rush = true;
      if (card.attribute === 'divine') card.attribute = 'dark';
      if (card.stType === 'link') card.stType = 'normal';

      let includesNormal = false;
      let frames: TFrame[] = [];
      for (let frame of card.frames) {
        if (frame === 'normal') includesNormal = true;
        if (COMMON_FRAMES.includes(frame)) frames.push(frame);
      }
      if (!frames.length) frames = ['effect'];
      card.frames = frames;

      if (card.frames.length === 1 && includesNormal && card.rushTextMode !== 'vanilla') {
        card.rushTextMode = 'vanilla';
      } else if ((!includesNormal || card.frames.length > 1) && card.rushTextMode === 'vanilla') {
        card.rushTextMode = 'regular';
      }

      return card;
    }
  }

  public async saveCurrentCard(card: ICard) {
    this._currentCard = card;
    await app.$store.set<ICard, TCardStorageKey>('current-card', this._currentCard);
    this.dispatch('currentCardUpdated', this.currentCard);
  }

  public async saveTempCurrentCard(card: ICard | undefined) {
    this._tempCurrentCard = card;
    await app.$store.set<ICard | undefined, TCardStorageKey>('temp-current-card', this._tempCurrentCard);
    this.dispatch('tempCurrentCardUpdated', this.tempCurrentCard);
  }

  public async saveCurrentOrTempToLocal() {
    if (this._tempCurrentCard) {
      await this.saveTempCurrentToLocal();
      this.dispatch('menuSaveTempToLocal');
    } else {
      await this.saveCurrentToLocal();
    }
  }

  public async saveCurrentToLocal() {
    const currentCard = await app.$store.get<ICard, TCardStorageKey>('current-card');
    if (!currentCard) return;

    const now = new Date();
    currentCard.created = now;
    currentCard.modified = now;
    currentCard.uuid = uuid();

    this._localCards.push(currentCard);
    await app.$store.set<ICard[], TCardStorageKey>('local-cards', this._localCards);
    this.dispatch('localCardsUpdated', this.localCards);
  }

  public async saveTempCurrentToLocal() {
    const tempCurrentCard = await app.$store.get<ICard, TCardStorageKey>('temp-current-card');
    if (!tempCurrentCard) return;

    tempCurrentCard.modified = new Date();

    this._localCards = this._localCards.map((c) => {
      if (c.uuid === tempCurrentCard.uuid) {
        return tempCurrentCard;
      } else {
        return c;
      }
    });
    await app.$store.set<ICard[], TCardStorageKey>('local-cards', this._localCards);
    this.dispatch('localCardsUpdated', this.localCards);

    this._tempCurrentCard = undefined;
    await app.$store.set<undefined, TCardStorageKey>('temp-current-card', this._tempCurrentCard);
    this.dispatch('tempCurrentCardUpdated', this.tempCurrentCard);
  }

  public async deleteLocalCard(card: ICard) {
    this._localCards = this._localCards.filter((c) => c.uuid !== card.uuid);
    await app.$store.set<ICard[], TCardStorageKey>('local-cards', this._localCards);
    this.dispatch('localCardsUpdated', this.localCards);
  }

  public async importCards(newCards: ICard[]) {
    let index = 0;
    for (const newCard of newCards) {
      index++;
      await this.importCard(newCard, index === newCards.length);
    }
  }

  public async importCard(newCard: ICard, updateTempCurrentCard: boolean) {
    if (this._tempCurrentCard) {
      await this.saveTempCurrentToLocal();
      this.dispatch('menuSaveTempToLocal');
    }

    const now = new Date();
    newCard.created = now;
    newCard.modified = now;
    newCard.uuid = uuid();
    this._localCards.push(newCard);
    await app.$store.set<ICard[], TCardStorageKey>('local-cards', this._localCards);
    this.dispatch('cardImported', newCard);
    this.dispatch('localCardsUpdated', this.localCards);

    if (updateTempCurrentCard) {
      this._tempCurrentCard = newCard;
      await app.$store.set<ICard | undefined, TCardStorageKey>('temp-current-card', this._tempCurrentCard);
      this.dispatch('tempCurrentCardLoaded', this.tempCurrentCard);
    }
  }

  public async importArtwork(url: string, path?: string): Promise<string | undefined> {
    if (!app.$device.isElectron(window)) return undefined;
    path = path || (await window.electron.ipcRenderer.invoke('getDirectoryPath'));
    if (!path) return '';
    return await window.electron.ipcRenderer.invoke('download', path, url);
  }

  private getDefaultCurrentCard(): ICard {
    return {
      language: 'fr',
      name: '',
      nameStyle: 'default',
      tcgAt: true,
      artwork: {
        url: '',
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        pendulum: false,
        keepRatio: false,
      },
      frames: ['effect'],
      multipleFrames: false,
      stType: 'normal',
      attribute: 'dark',
      noTextAttribute: false,
      abilities: [],
      level: 0,
      atk: '',
      def: '',
      description: '',
      pendulum: false,
      pendEffect: '',
      scales: {
        left: 0,
        right: 0,
      },
      linkArrows: {
        top: false,
        bottom: false,
        left: false,
        right: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      },
      edition: 'unlimited',
      cardSet: '',
      passcode: '',
      sticker: 'none',
      hasCopyright: false,
      oldCopyright: false,
      speed: false,
      rush: false,
      dontCoverRushArt: false,
      rushTextMode: 'regular',
      rushOtherEffects: '',
      rushCondition: '',
      rushEffect: '',
      rushEffectType: 'effect',
      rushChoiceEffects: ['', ''],
      legendType: 'gold',
      legend: false,
      atkMax: '',
      maximum: false,
    };
  }

  public get defaultImportCard(): ICard {
    return {
      language: 'en',
      name: '',
      nameStyle: 'default',
      tcgAt: true,
      artwork: {
        url: '',
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        pendulum: false,
        keepRatio: false,
      },
      frames: [],
      multipleFrames: false,
      stType: 'normal',
      attribute: 'spell',
      noTextAttribute: false,
      abilities: [],
      level: 0,
      atk: '',
      def: '',
      description: '',
      pendulum: false,
      pendEffect: '',
      scales: {
        left: 0,
        right: 0,
      },
      linkArrows: {
        top: false,
        bottom: false,
        left: false,
        right: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      },
      edition: 'firstEdition',
      cardSet: '',
      passcode: '',
      sticker: 'silver',
      hasCopyright: true,
      oldCopyright: false,
      speed: false,
      rush: false,
      dontCoverRushArt: false,
      rushTextMode: 'regular',
      rushOtherEffects: '',
      rushCondition: '',
      rushEffect: '',
      rushEffectType: 'effect',
      rushChoiceEffects: ['', ''],
      legendType: 'gold',
      legend: false,
      atkMax: '',
      maximum: false,
    };
  }

  public getFullCardPreset(): Crop {
    return {
      x: 12.45,
      y: 18.5,
      width: 75.3,
      height: 51.85,
      unit: '%',
    };
  }

  public getFullPendulumCardPreset(): Crop {
    return {
      x: 7.15,
      y: 18.25,
      width: 85.75,
      height: 44,
      unit: '%',
    };
  }

  public getFullRushCardPreset(): Crop {
    return {
      x: 5.3,
      y: 10,
      width: 89.4,
      height: 62,
      unit: '%',
    };
  }

  public generatePasscode() {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result = `${result}${Math.floor(Math.random() * 10)}`;
    }
    return result;
  }

  public getMasterStIcon(card: ICard) {
    switch (card.stType) {
      case 'normal':
        if (card.frames.includes('spell')) return this.paths.master.spellTraps[card.language].normalSpell;
        else return this.paths.master.spellTraps[card.language].normalTrap;
      case 'ritual':
        return this.paths.master.spellTraps[card.language].ritual;
      case 'quickplay':
        return this.paths.master.spellTraps[card.language].quickplay;
      case 'field':
        return this.paths.master.spellTraps[card.language].field;
      case 'continuous':
        return this.paths.master.spellTraps[card.language].continuous;
      case 'equip':
        return this.paths.master.spellTraps[card.language].equip;
      case 'counter':
        return this.paths.master.spellTraps[card.language].counter;
      case 'link':
        return this.paths.master.spellTraps[card.language].link;
      default:
        return '';
    }
  }

  public getStIconName(icon: TStIcon) {
    switch (icon) {
      case 'normal':
        return 'Normal';
      case 'continuous':
        return 'Continu';
      case 'counter':
        return 'Contre';
      case 'equip':
        return 'Équipement';
      case 'field':
        return 'Terrain';
      case 'link':
        return 'Lien';
      case 'quickplay':
        return 'Jeu-Rapide';
      case 'ritual':
        return 'Rituel';
      default:
        return 'Inconnu';
    }
  }

  public getStTypeName(stType: TStIcon, language: TCardLanguage, feminine: boolean) {
    switch (stType) {
      case 'normal':
        if (language === 'fr') {
          return feminine ? 'Normale' : 'Normal';
        } else {
          return 'Normal';
        }

      case 'continuous':
        if (language === 'fr') {
          return feminine ? 'Continue' : 'Continu';
        } else {
          return 'Continuous';
        }

      case 'counter':
        if (language === 'fr') {
          return 'Contre';
        } else {
          return 'Counter';
        }

      case 'equip':
        if (language === 'fr') {
          return 'Équipement';
        } else {
          return 'Equip';
        }

      case 'field':
        if (language === 'fr') {
          return 'Terrain';
        } else {
          return 'Field';
        }

      case 'link':
        if (language === 'fr') {
          return 'Lien';
        } else {
          return 'Link';
        }

      case 'quickplay':
        if (language === 'fr') {
          return 'Jeu-Rapide';
        } else {
          return 'Quick-Play';
        }

      case 'ritual':
        if (language === 'fr') {
          return feminine ? 'Rituelle' : 'Ritual';
        } else {
          return 'Ritual';
        }

      default:
        if (language === 'fr') {
          return feminine ? 'Inconnue' : 'Inconnu';
        } else {
          return 'Unknown';
        }
    }
  }

  public getAttributeName(attribute: TAttribute) {
    switch (attribute) {
      case 'dark':
        return 'TÉNÈBRES';
      case 'light':
        return 'LUMIÈRE';
      case 'water':
        return 'EAU';
      case 'earth':
        return 'TERRE';
      case 'wind':
        return 'VENT';
      case 'fire':
        return 'FEU';
      case 'divine':
        return 'DIVIN';
      case 'spell':
        return 'MAGIE';
      case 'trap':
        return 'PIÈGE';
      default:
        return 'INCONNU';
    }
  }

  public getFrameName(frame: TFrame) {
    switch (frame) {
      case 'normal':
        return 'Normal';
      case 'effect':
        return 'Effet';
      case 'ritual':
        return 'Rituel';
      case 'fusion':
        return 'Fusion';
      case 'synchro':
        return 'Synchro';
      case 'darkSynchro':
        return 'Synchro des Ténèbres';
      case 'xyz':
        return 'Xyz';
      case 'link':
        return 'Lien';
      case 'spell':
        return 'Magie';
      case 'trap':
        return 'Piège';
      case 'token':
        return 'Jeton';
      case 'monsterToken':
        return 'Jeton Monstre';
      case 'skill':
        return 'Compétence';
      case 'obelisk':
        return 'Obelisk';
      case 'slifer':
        return 'Slifer';
      case 'ra':
        return 'Ra';
      case 'legendaryDragon':
        return 'Dragon Légendaire';
      default:
        return 'Inconnu';
    }
  }

  public getFramesNames(frames: TFrame[]) {
    const names: string[] = [];
    for (const frame of frames) {
      names.push(this.getFrameName(frame));
    }
    return names.join(' / ');
  }

  public hasMaterials(card: ICard): boolean {
    if (!card.frames?.length) return false;

    for (const frame of card.frames) {
      if (frame === 'fusion' || frame === 'synchro' || frame === 'darkSynchro' || frame === 'xyz' || frame === 'link') {
        return true;
      }
    }

    return false;
  }

  public hasLinkArrows(card: ICard): boolean {
    for (const frame of card.frames) {
      if (frame === 'link') {
        return true;
      } else if (frame === 'spell' && card.stType === 'link') {
        return true;
      } else if (frame === 'trap' && card.stType === 'link') {
        return true;
      }
    }
    return false;
  }

  public hasPendulumFrame(card: ICard): boolean {
    if (!card.pendulum) return false;

    let includesSpell = false;
    let includesTrap = false;
    let includesToken = false;
    let includesSkill = false;
    let includesLegendaryDragon = false;

    for (const frame of card.frames) {
      if (frame === 'spell') {
        includesSpell = true;
      } else if (frame === 'trap') {
        includesTrap = true;
      } else if (frame === 'token') {
        includesToken = true;
      } else if (frame === 'skill') {
        includesSkill = true;
      } else if (frame === 'legendaryDragon') {
        includesLegendaryDragon = true;
      }
    }

    return !includesSpell && !includesTrap && !includesToken && !includesSkill && !includesLegendaryDragon;
  }

  public hasAbilities(card: ICard): boolean {
    if (card.rush) return true;

    let includesSpell = false;
    let includesTrap = false;
    let includesToken = false;
    let includesLegendaryDragon = false;

    for (let frame of card.frames) {
      if (frame === 'spell') {
        includesSpell = true;
      } else if (frame === 'trap') {
        includesTrap = true;
      } else if (frame === 'token') {
        includesToken = true;
      } else if (frame === 'legendaryDragon') {
        includesLegendaryDragon = true;
      }
    }

    return !includesSpell && !includesTrap && !includesToken && !includesLegendaryDragon;
  }

  public hasRushMonsterDetails(card: ICard): boolean {
    if (!card.rush) return false;

    let includesSpell = false;
    let includesTrap = false;
    let includesToken = false;
    let includesLegendaryDragon = false;

    for (let frame of card.frames) {
      if (frame === 'spell') {
        includesSpell = true;
      } else if (frame === 'trap') {
        includesTrap = true;
      } else if (frame === 'token') {
        includesToken = true;
      } else if (frame === 'legendaryDragon') {
        includesLegendaryDragon = true;
      }
    }

    return !includesSpell && !includesTrap && !includesToken && !includesLegendaryDragon;
  }

  public isBackrow(card: ICard) {
    for (let frame of card.frames) {
      if (frame === 'spell' || frame === 'trap') {
        return true;
      }
    }
    return false;
  }

  public getDescriptionPlaceholder(card: ICard) {
    if (card.frames.length === 1 && FRAMES_WITH_DESCRIPTION.includes(card.frames[0]!)) return 'Description';
    return 'Effet';
  }

  public async showImportDialog() {
    return await CardImportDialog.show();
  }
}
