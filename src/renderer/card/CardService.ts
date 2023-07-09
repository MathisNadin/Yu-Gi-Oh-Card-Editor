/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
/* eslint-disable no-else-return */
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
import { createRoot } from "react-dom/client";
import { CardBuilder } from "renderer/card-builder/CardBuilder";
import { ICard, CardStorageKey, TFrame } from "./card-interfaces";

export interface ICardListener {
  currentCardLoaded: (currentCard: ICard) => void;
  currentCardUpdated: (currentCard: ICard) => void;
  tempCurrentCardLoaded: (tempCurrentCard: ICard) => void;
  tempCurrentCardUpdated: (tempCurrentCard: ICard) => void;
  localCardsLoaded: (localCards: ICard[]) => void;
  localCardsUpdated: (localCards: ICard[]) => void;
  menuSaveTempToLocal: () => void;
}

export class CardService extends Observable<ICardListener> implements Partial<IIndexedDBListener> {
  private _currentCard = {} as ICard;
  private _tempCurrentCard: ICard | undefined = undefined;
  private _localCards: ICard[] = [];

  public get currentCard() {
    return this._currentCard;
  }

  public get tempCurrentCard() {
    return this._tempCurrentCard;
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

  private fireCurrentCardLoaded() {
    this.dispatch('currentCardLoaded', this.currentCard);
  }

  private fireCurrentCardUpdated() {
    this.dispatch('currentCardUpdated', this.currentCard);
  }

  private fireTempCurrentCardLoaded() {
    this.dispatch('tempCurrentCardLoaded', this.tempCurrentCard);
  }

  private fireTempCurrentCardUpdated() {
    this.dispatch('tempCurrentCardUpdated', this.tempCurrentCard);
  }

  private fireLocalCardsLoaded() {
    this.dispatch('localCardsLoaded', this.localCards);
  }

  private fireLocalCardsUpdated() {
    this.dispatch('localCardsUpdated', this.localCards);
  }

  public fireMenuSaveTempToLocal() {
    this.dispatch('menuSaveTempToLocal');
  }

  private async load(initial: boolean) {
    this._localCards = await app.$indexedDB.get<ICard[], CardStorageKey>('local-cards');
    if (!this._localCards) this._localCards = [];

    this._tempCurrentCard = await app.$indexedDB.get<ICard, CardStorageKey>('temp-current-card');

    this._currentCard = await app.$indexedDB.get<ICard, CardStorageKey>('current-card');
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
          width: 0,
          pendulum: false
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
      await app.$indexedDB.save<CardStorageKey, ICard>('current-card', this._currentCard);
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
    let name = this._tempCurrentCard ? this._tempCurrentCard.name : this._currentCard.name;
    await this.writeCardFile('main-card-builder', name);
  }

  public async renderCards(cards: ICard[]) {
    const path = await window.electron.ipcRenderer.getDirectoryPath();
    if (!path) return;

    for (let card of cards) {
      let cardBuilder = new CardBuilder({
        forRender: true,
        id: card.uuid as string,
        card,
        onCardReady: () => app.$errorManager.handlePromise(this.writeCardFile(card.uuid as string, card.name, path)),
      });
      const rootElement = document.querySelector('.card-preview') as HTMLElement;
      const popupContainer = document.createElement('div');
      popupContainer.className = 'mn-render-container';
      rootElement.appendChild(popupContainer);
      createRoot(popupContainer).render(cardBuilder.render());
    }
  }

  private async writeCardFile(id: string, name: string, filePath?: string) {
    const element = document.getElementById(id) as HTMLElement;
    console.log(id, name, filePath, element);
    if (element) {
      try {
        const dataUrl = await toPng(element);
        if (!dataUrl) return;
        await window.electron.ipcRenderer.writePngFile(name || 'Sans nom', dataUrl.replace(/^data:image\/\w+;base64,/, ''), filePath);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }

  public async saveCurrentCard(card: ICard) {
    this._currentCard = card;
    await app.$indexedDB.save<CardStorageKey, ICard>('current-card', this._currentCard);
    this.fireCurrentCardUpdated();
  }

  public async saveTempCurrentCard(card: ICard | undefined) {
    this._tempCurrentCard = card;
    await app.$indexedDB.save<CardStorageKey, (ICard | undefined)>('temp-current-card', this._tempCurrentCard);
    this.fireTempCurrentCardUpdated();
  }

  public async saveCurrentOrTempToLocal() {
    if (this._tempCurrentCard) {
      await this.saveTempCurrentToLocal();
      this.fireMenuSaveTempToLocal();
    } else {
      await this.saveCurrentToLocal();
    }
  }

  public async saveCurrentToLocal() {
    const currentCard = await app.$indexedDB.get<ICard, CardStorageKey>('current-card');
    const now = new Date();
    currentCard.created = now;
    currentCard.modified = now;
    currentCard.uuid = uuid();
    this._localCards.push(currentCard);
    await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
    this.fireLocalCardsUpdated();
  }

  public async saveTempCurrentToLocal() {
    const tempCurrentCard = await app.$indexedDB.get<ICard, CardStorageKey>('temp-current-card');
    tempCurrentCard.modified = new Date();
    this._localCards = this._localCards.map(c => {
      if (c.uuid === tempCurrentCard.uuid) {
        return tempCurrentCard;
      } else {
        return c;
      }
    });
    await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
    this.fireLocalCardsUpdated();

    this._tempCurrentCard = undefined;
    await app.$indexedDB.save<CardStorageKey, undefined>('temp-current-card', this._tempCurrentCard);
    this.fireTempCurrentCardUpdated();
  }

  public async deleteLocalCard(card: ICard) {
    this._localCards = this._localCards.filter(c => c.uuid !== card.uuid);
    await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
    this.fireLocalCardsUpdated();
  }

  public async importCard(newCard: ICard) {
    const now = new Date();
    if (this._tempCurrentCard) {
      newCard.created = this._tempCurrentCard.created;
      newCard.modified = this._tempCurrentCard.created;
      newCard.uuid = this._tempCurrentCard.uuid;
      await this.saveTempCurrentCard(newCard);
    }
    else {
      newCard.created = now;
      newCard.modified = now;
      newCard.uuid = uuid();
      this._localCards.push(newCard);
      await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
      this.fireLocalCardsUpdated();

      this._tempCurrentCard = newCard;
      await app.$indexedDB.save<CardStorageKey, (ICard | undefined)>('temp-current-card', this._tempCurrentCard);
      this.fireTempCurrentCardLoaded();
    }
  }

  public getFrameName(frame: TFrame) {
    switch (frame) {
      case 'normal': return 'Normal';
      case 'effect': return 'Effet';
      case 'ritual': return 'Rituel';
      case 'fusion': return 'Fusion';
      case 'synchro': return 'Synchro';
      case 'darkSynchro': return 'Synchro des Ténèbres';
      case 'xyz': return 'Xyz';
      case 'link': return 'Lien';
      case 'spell': return 'Magie';
      case 'trap': return 'Piège';
      case 'token': return 'Jeton';
      case 'monsterToken': return 'Jeton Monstre';
      case 'skill': return 'Compétence';
      case 'obelisk': return 'Obelisk';
      case 'slifer': return 'Slifer';
      case 'ra': return 'Ra';
      case 'legendaryDragon': return 'Dragon Légendaire';
      default: return 'Inconnu';
    }
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

  public getNewCard(): ICard {
    return {
      name: '',
      nameStyle: 'default',
      tcgAt: false,
      artwork: {
        url: '',
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        pendulum: false
      },
      frame: 'normal',
      stType: 'normal',
      attribute: 'spell',
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
      edition: 'firstEdition',
      cardSet: '',
      passcode: '',
      sticker: 'silver',
      hasCopyright: true,
      oldCopyright: false,
      speed: false,
      rush: false,
      legend: false,
      atkMax: 0
    };
  }
}
