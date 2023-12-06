export type TCardLanguage = 'fr' | 'en';

export type TFrame =
  'normal' | 'effect' | 'ritual' | 'fusion' |
  'synchro' | 'darkSynchro' | 'xyz' | 'link' |
  'spell' | 'trap' | 'token' | 'monsterToken' |
  'skill' | 'obelisk' | 'slifer' | 'ra' | 'legendaryDragon';

export type TAttribute = 'dark' | 'light' | 'water' | 'fire' | 'earth' | 'wind' | 'divine' | 'spell' | 'trap';

export type TStIcon = 'normal' | 'ritual' | 'quickplay' | 'field' | 'continuous' | 'equip' | 'counter' | 'link';

export type TNameStyle = 'default' | 'white' | 'black' | 'yellow' | 'gold' | 'silver' | 'rare' | 'ultra' | 'secret';

export type TEdition = 'unlimited' | 'firstEdition' | 'limited' | 'forbidden' | 'forbiddenDeck' | 'duelTerminal' | 'anime';

export type TSticker = 'none' | 'silver' | 'gold' | 'grey' | 'white' | 'lightBlue' | 'skyBlue' | 'cyan' | 'aqua' | 'green';

export type TLinkArrows = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export type TLegendType = 'gold' | 'goldFoil' | 'silver' | 'silverFoil';

export type TRushTextMode = 'vanilla' | 'regular' | 'choice';

export type TRushEffectType = 'effect' | 'continuous';

export type CardStorageKey = 'current-card' | 'temp-current-card' | 'local-cards';

export interface ICard {
  uuid?: string;
  created?: Date,
  modified?: Date,
  language: TCardLanguage;
  name: string;
  nameStyle: TNameStyle;
  tcgAt: boolean;
  artwork: {
    url: string;
    x: number;
    y: number;
    height: number;
    width: number;
    pendulum: boolean;
    keepRatio: boolean;
  };
  frames: TFrame[];
  multipleFrames: boolean;
  stType: TStIcon;
  attribute: TAttribute;
  noTextAttribute: boolean;
  abilities: string[];
  level: number;
  atk: string;
  def: string;
  description: string;
  pendulum: boolean;
  pendEffect: string;
  scales: {
    left: number;
    right: number;
  };
  linkArrows: { [key in TLinkArrows]: boolean };
  edition: TEdition;
  cardSet: string;
  passcode: string;
  sticker: TSticker;
  hasCopyright: boolean;
  oldCopyright: boolean;
  speed: boolean;
  rush: boolean;
  dontCoverRushArt: boolean;
  rushTextMode: TRushTextMode;
  rushOtherEffects: string;
  rushCondition: string;
  rushEffect: string;
  rushEffectType: TRushEffectType;
  rushChoiceEffects: string[];
  legend: boolean;
  legendType: TLegendType;
  maximum: boolean;
  atkMax: string;
}

export interface ICurrentCardToDo {
  name: boolean;
  atk: boolean;
  def: boolean;
  pend: boolean;
  abilities: boolean;
  desc: boolean;
}
