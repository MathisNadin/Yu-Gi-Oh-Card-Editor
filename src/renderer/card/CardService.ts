/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
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
import { deepClone, uuid } from "mn-toolkit/tools";
import { ICard, CardStorageKey, TFrame } from "./card-interfaces";

interface IExportData {
  'current-card': ICard,
  'temp-current-card': ICard,
  'local-cards': ICard[],
}

export interface ICardListener {
  currentCardLoaded: (currentCard: ICard) => void;
  currentCardUpdated: (currentCard: ICard) => void;
  tempCurrentCardLoaded: (tempCurrentCard: ICard) => void;
  tempCurrentCardUpdated: (tempCurrentCard: ICard) => void;
  localCardsLoaded: (localCards: ICard[]) => void;
  localCardsUpdated: (localCards: ICard[]) => void;
  renderCardChanged: (renderCard: ICard) => void;
  renderCardDone: () => void;
  menuSaveTempToLocal: () => void;
}

export class CardService extends Observable<ICardListener> implements Partial<IIndexedDBListener> {
  private _currentCard = {} as ICard;
  private _tempCurrentCard: ICard | undefined = undefined;
  private _renderCard: ICard | undefined = undefined;
  private _renderCardsQueue: ICard[] = [];
  private _localCards: ICard[] = [];
  private _renderPath: string | undefined = undefined;

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

  public fireRenderCardChanged() {
    this.dispatch('renderCardChanged', this._renderCard);
  }

  public fireRenderCardDone() {
    this.dispatch('renderCardDone');
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
          pendulum: false,
          keepRatio: false
        },
        frames: ['effect'],
        multipleFrames: false,
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

  public async importData() {
    let buffer = await window.electron.ipcRenderer.readFileUtf8([{ extensions: ['json'], name: 'JSON File' }]);
    if (!buffer) return;

    let data = JSON.parse(buffer.toString()) as IExportData;
    if (!data) return;

    if (data['local-cards']) {
      this._localCards = deepClone(data['local-cards']);
      await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
      this.fireLocalCardsUpdated();
    }

    if (data['current-card']) {
      this._currentCard = deepClone(data['current-card']);
      await app.$indexedDB.save<CardStorageKey, ICard>('current-card', this._currentCard);
      this.fireCurrentCardUpdated();
    }

    if (data['temp-current-card']) {
      this._tempCurrentCard = deepClone(data['temp-current-card']);
      await app.$indexedDB.save<CardStorageKey, ICard>('temp-current-card', this._tempCurrentCard);
      this.fireTempCurrentCardUpdated();
    }
  }

  public async exportData() {
    let data: IExportData = {
      "current-card": this._currentCard,
      "temp-current-card": this._tempCurrentCard as ICard,
      "local-cards": this._localCards
    };
    await window.electron.ipcRenderer.writeJsonFile('card_editor_data.json', JSON.stringify(data));
  }

  public async renderCurrentCard() {
    const cardUuid = (this._tempCurrentCard ? this._tempCurrentCard.uuid : this._currentCard.uuid) as string;
    const cardName = this._tempCurrentCard ? this._tempCurrentCard.name : this._currentCard.name;
    await this.writeCardFile('main-card-builder', cardUuid, cardName);
  }

  private setRenderCard() {
    this._renderCard = this._renderCardsQueue[0];
    this.fireRenderCardChanged();
  }

  public async renderCards(cards: ICard[]) {
    if (!cards?.length) return;

    this._renderPath = await window.electron.ipcRenderer.getDirectoryPath();
    if (!this._renderPath) return;

    this._renderCardsQueue.push(...cards);
    this.setRenderCard();
  }

  public async writeCardFile(id: string, cardUuid: string, cardName: string) {
    const element = document.getElementById(id) as HTMLElement;
    if (element) {
      try {
        const dataUrl = await toPng(element);
        if (!dataUrl) return;
        await window.electron.ipcRenderer.writePngFile(
          cardName.replace(/[\\/:"*?<>|]/g, '') || 'Sans nom',
          dataUrl.replace(/^data:image\/\w+;base64,/, ''),
          this._renderPath
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    if (this._renderCardsQueue.length) {
      this._renderCardsQueue = this._renderCardsQueue.filter(c => c.uuid !== cardUuid);
      this.fireRenderCardDone();
      if (this._renderCardsQueue.length) {
        this.setRenderCard();
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

  public async importCards(newCards: ICard[]) {
    let index = 0;
    for (let newCard of newCards) {
      index++;
      await this.importCard(newCard, index === newCards.length);
    }
  }

  public async importCard(newCard: ICard, updateTempCurrentCard: boolean) {
    if (this._tempCurrentCard) {
      await this.saveTempCurrentToLocal();
      this.fireMenuSaveTempToLocal();
    }

    const now = new Date();
    newCard.created = now;
    newCard.modified = now;
    newCard.uuid = uuid();
    this._localCards.push(newCard);
    await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
    this.fireLocalCardsUpdated();

    if (updateTempCurrentCard) {
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

  public getFramesNames(frames: TFrame[]) {
    let names: string[] = [];
    for (let frame of frames) {
      names.push(this.getFrameName(frame));
    }
    return names.join(' / ');
  }

  public hasLinkArrows(card: ICard): boolean {
    return card.frames.includes('link') || ((card.frames.includes('spell') || card.frames.includes('trap')) && card.stType === 'link');
  }

  public hasPendulumFrame(card: ICard): boolean {
    return card.pendulum
      && !card.frames.includes('token')
      && !card.frames.includes('spell')
      && !card.frames.includes('trap')
      && !card.frames.includes('skill')
      && !card.frames.includes('legendaryDragon');
  }

  public hasAbilities(card: ICard): boolean {
    return !card.frames.includes('token')
      && !card.frames.includes('spell')
      && !card.frames.includes('trap')
      && !card.frames.includes('legendaryDragon');
  }

  public getDefaultImportCard(): ICard {
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
        pendulum: false,
        keepRatio: false
      },
      frames: [],
      multipleFrames: false,
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