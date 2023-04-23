/* eslint-disable lines-between-class-members */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

import { toPng } from "html-to-image";
import { IIndexedDBListener } from "mn-toolkit/indexedDB/IndexedDBService";
import { Observable } from "mn-toolkit/observable/Observable";
import { uuid } from "mn-toolkit/tools";

export type TFrame =
  'normal' | 'effect' | 'ritual' | 'fusion' |
  'synchro' | 'darkSynchro' | 'xyz' | 'link' |
  'spell' | 'trap' | 'token' | 'monsterToken' |
  'skill' | 'obelisk' | 'slifer' | 'ra' | 'legendaryDragon';

export type TAttribute = 'dark' | 'light' | 'water' | 'fire' | 'earth' | 'wind' | 'divine' | 'spell' | 'trap';

export type TStIcon = 'normal' | 'ritual' | 'quickplay' | 'field' | 'continuous' | 'equip' | 'counter' | 'link';

export type TNameStyle = 'default' | 'white' | 'black' | 'yellow' | 'gold' | 'silver' | 'rare' | 'ultra' | 'secret';

export type TEdition = 'unlimited' | 'firstEdition' | 'limited' | 'forbidden' | 'duelTerminal' | 'anime';

export type TSticker = 'none' | 'silver' | 'gold' | 'grey' | 'white' | 'lightBlue' | 'skyBlue' | 'cyan' | 'aqua' | 'green';

export type TLinkArrows = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ICard {
  uuid?: string;
  created?: Date,
  modified?: Date,
  name: string;
  nameStyle: TNameStyle;
  tcgAt: boolean;
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
  legend: boolean;
  atkMax: number;
}

export interface ICardListener {
  currentCardLoaded: (currentCard: ICard) => void;
  currentCardUpdated: (currentCard: ICard) => void;
  localCardsLoaded: (localCards: ICard[]) => void;
  localCardsUpdated: (localCards: ICard[]) => void;
}

export class CardService extends Observable<ICardListener> implements Partial<IIndexedDBListener> {
  private _currentCard = {} as ICard;
  private _localCards: ICard[] = [];

  public get currentCard() {
    return this._currentCard;
  }

  public get localCards() {
    return this._localCards;
  }

  public constructor() {
    super();
    app.$indexedDB.addListener(this);
    app.$errorManager.handlePromise(this.load(true));
  }

  public allDeleted() {
    app.$errorManager.handlePromise(this.load(false));
  }

  public fireCurrentCardLoaded() {
    this.dispatch('currentCardLoaded', this.currentCard);
  }

  public fireCurrentCardUpdated() {
    this.dispatch('currentCardUpdated', this.currentCard);
  }

  public fireLocalCardsLoaded() {
    this.dispatch('localCardsLoaded', this.localCards);
  }

  public fireLocalCardsUpdated() {
    this.dispatch('localCardsUpdated', this.localCards);
  }

  private async load(initial: boolean) {
    this._localCards = await app.$indexedDB.get<ICard[]>('local-cards');
    if (!this._localCards) this._localCards = [];

    this._currentCard = await app.$indexedDB.get<ICard>('current-card');
    if (!this._currentCard) {
      this._currentCard = {
        name: '',
        nameStyle: 'default',
        tcgAt: true,
        artwork: {
          url: '',
          x: 0,
          y: 0,
          height: 0,
          width: 0
        },
        frame: 'effect',
        stType: 'normal',
        attribute: 'dark',
        abilities: [],
        level: 0,
        atk: '',
        def: '',
        description: '',
        pendulum: false,
        pendEffect: '',
        scales: {
          left: 0,
          right: 0
        },
        linkArrows: {
          top: false,
          bottom: false,
          left: false,
          right: false,
          topLeft: false,
          topRight: false,
          bottomLeft: false,
          bottomRight: false
        },
        edition: 'unlimited',
        cardSet: '',
        passcode: '',
        sticker: 'none',
        hasCopyright: false,
        oldCopyright: false,
        speed: false,
        rush: false,
        legend: false,
        atkMax: 0
      };
      await app.$indexedDB.save<ICard>('current-card', this._currentCard);
    }

    if (initial) {
      this.fireCurrentCardLoaded();
      this.fireLocalCardsLoaded();
    } else {
      this.fireCurrentCardUpdated();
      this.fireLocalCardsUpdated();
    }
  }

  public async renderCurrentCard() {
    const element = document.querySelector('.card-builder') as HTMLElement;
    if (element) {
      try {
        const dataUrl = await toPng(element);
        if (!dataUrl) return;
        await window.electron.ipcRenderer.writePngFile(app.$card._currentCard.name || 'Sans nom', dataUrl.replace(/^data:image\/\w+;base64,/, ''));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }

  public async saveCurrentCard(card: ICard) {
    this._currentCard = card;
    await app.$indexedDB.save<ICard>('current-card', this._currentCard);
    this.fireCurrentCardUpdated();
  }

  public async saveCurrentToLocal() {
    const currentCard = await app.$indexedDB.get<ICard>('current-card');
    const now = new Date();
    currentCard.created = now;
    currentCard.modified = now;
    currentCard.uuid = uuid();
    this._localCards.push(currentCard);
    await app.$indexedDB.save<ICard[]>('local-cards', this._localCards);
    this.fireLocalCardsUpdated();
  }

  public hasLinkArrows(card: ICard): boolean {
    return card.frame === 'link' || ((card.frame === 'spell' || card.frame === 'trap') && card.stType === 'link');
  }

  public hasPendulumFrame(card: ICard): boolean {
    return card.pendulum
      && card.frame !== 'token'
      && card.frame !== 'spell'
      && card.frame !== 'trap'
      && card.frame !== 'skill'
      && card.frame !== 'legendaryDragon';
  }

  public hasAbilities(card: ICard): boolean {
    return card.frame !== 'token'
      && card.frame !== 'spell'
      && card.frame !== 'trap'
      && card.frame !== 'legendaryDragon';
  }
}
