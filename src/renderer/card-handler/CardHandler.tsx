/* eslint-disable import/no-dynamic-require */
/* eslint-disable lines-between-class-members */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import './styles.css';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { BatchDisplay } from 'renderer/batch-display/BatchDisplay';
import { CardEditor } from 'renderer/card-editor/CardEditor';
import { CardPreview } from 'renderer/card-preview/CardPreview';

export type TFrame =
  'normal' | 'effect' | 'ritual' | 'fusion' |
  'synchro' | 'darkSynchro' | 'xyz' | 'link' |
  'spell' | 'trap' | 'token' | 'tokenAtkDef' |
  'skill' | 'obelisk' | 'slifer' | 'ra' | 'legendaryDragon';

export type TAttribute = 'dark' | 'light' | 'water' | 'fire' | 'earth' | 'wind' | 'divine' | 'spell' | 'trap';

export type TStIcon = 'none' | 'ritual' | 'quickplay' | 'field' | 'continuous' | 'equip' | 'link' | 'counter';

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

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> {

  public constructor(props: ICardHandlerProps) {
    super(props);
  }

  public render() {
    return this.renderAttributes(<HorizontalStack>
      <CardEditor />
      <CardPreview cardFrame='Monstre à Effet' level='2' />
      <BatchDisplay />
    </HorizontalStack>, 'card-handler');
  }
}
