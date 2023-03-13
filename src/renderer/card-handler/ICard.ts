/* eslint-disable prettier/prettier */

export type TFrame =
  'normal' | 'effect' | 'ritual' | 'fusion' |
  'synchro' | 'darkSynchro' | 'xyz' | 'link' |
  'spell' | 'trap' | 'token' | 'tokenAtkDef' |
  'skill' | 'obelisk' | 'slifer' | 'ra' | 'legendaryDragon';

export type TAttribute = 'dark' | 'light' | 'water' | 'fire' | 'earth' | 'wind' | 'divine' | 'spell' | 'trap';

export type TStIcon = 'normal' | 'ritual' | 'quickplay' | 'field' | 'continuous' | 'equip' | 'link' | 'counter';

export type TNameStyle = 'default' | 'white' | 'black' | 'yellow' | 'gold' | 'silver' | 'rare' | 'ultra' | 'secret';

export type TEdition = 'unlimited' | 'firstEdition' | 'limited' | 'forbidden' | 'duelTerminal' | 'anime';

export type TSticker = 'none' | 'silver' | 'gold' | 'grey' | 'white' | 'lightBlue' | 'skyBlue' | 'cyan' | 'aqua' | 'green';

export interface ICard {
  name: string;
  nameStyle: TNameStyle;
  artwork: {
    url: string;
    x: number;
    y: number;
    height: number;
    width: number;
  };
  frame: TFrame;
  stType: TStIcon;
  attribute: TAttribute;
  abilities: string[];
  level: number;
  atk: number;
  def: number;
  description: string;
  pendulum: boolean;
  pendEffect: string;
  scales: {
    left: number;
    right: number;
  };
  linkArrows: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
    topLeft: boolean;
    topRight: boolean;
    bottomLeft: boolean;
    bottomRight: boolean;
  }
  edition: TEdition;
  cardSet: string;
  passcode: number;
  sticker: TSticker;
  copyright: boolean;
  oldCopyright: boolean;
  speed: boolean;
  rush: boolean;
  legend: boolean;
  atkMax: number;
}
