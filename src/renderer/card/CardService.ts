/* eslint-disable import/order */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
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

import { toPng } from "mn-html-to-image";
import { IIndexedDBListener } from "mn-toolkit/indexedDB/IndexedDBService";
import { Observable } from "mn-toolkit/observable/Observable";
import { deepClone, uuid } from "mn-toolkit/tools";
import { ICard, CardStorageKey, TFrame, TAttribute, TStIcon, TCardLanguage } from "./card-interfaces";
import { Crop } from "react-image-crop";

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

  public correct(card: ICard) {
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
      right: 0
    };
    card.linkArrows = card.linkArrows || {
      top: false,
      bottom: false,
      left: false,
      right: false,
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false
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
    }
    else if (card.rushChoiceEffects.length === 1) {
      card.rushChoiceEffects = [card.rushChoiceEffects[0], ''];
    }

    card.rushEffectType = card.rushEffectType || 'effect';
    card.legend = card.legend || false;
    card.legendType = card.legendType || 'gold';
    card.atkMax = typeof card.atkMax === 'number' ? '' : card.atkMax || '';
    card.maximum = card.maximum || false;
  }

  private async load(initial: boolean) {
    this._localCards = await app.$indexedDB.get<ICard[], CardStorageKey>('local-cards');
    if (this._localCards?.length) {
      for (let localCard of this._localCards) {
        this.correct(localCard);
      }
      await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
    } else {
      this._localCards = [];
    }

    this._tempCurrentCard = await app.$indexedDB.get<ICard, CardStorageKey>('temp-current-card');
    if (this._tempCurrentCard) {
      this.correct(this._tempCurrentCard);
      await app.$indexedDB.save<CardStorageKey, ICard>('temp-current-card', this._tempCurrentCard);
    }

    this._currentCard = await app.$indexedDB.get<ICard, CardStorageKey>('current-card');
    if (this._currentCard) {
      this.correct(this._currentCard);
    } else {
      this._currentCard = this.getDefaultCurrentCard();
    }
    await app.$indexedDB.save<CardStorageKey, ICard>('current-card', this._currentCard);

    if (initial) {
      this.fireLocalCardsLoaded();
      this.fireCurrentCardLoaded();
      this.fireTempCurrentCardLoaded();
    } else {
      this.fireLocalCardsUpdated();
      this.fireCurrentCardUpdated();
      this.fireTempCurrentCardUpdated();
    }
  }

  public async importData() {
    let buffer = await window.electron.ipcRenderer.readFileUtf8([{ extensions: ['json'], name: 'JSON File' }]);
    if (!buffer) return;

    let data = JSON.parse(buffer.toString()) as IExportData;
    if (!data) return;

    if (data['local-cards']) {
      this._localCards = deepClone(data['local-cards']);
      if (this._localCards?.length) {
        for (let localCard of this._localCards) {
          this.correct(localCard);
        }
      }
      await app.$indexedDB.save<CardStorageKey, ICard[]>('local-cards', this._localCards);
      this.fireLocalCardsUpdated();
    }

    if (data['current-card']) {
      this._currentCard = deepClone(data['current-card']);
      if (this._currentCard) {
        this.correct(this._currentCard);
      }
      await app.$indexedDB.save<CardStorageKey, ICard>('current-card', this._currentCard);
      this.fireCurrentCardUpdated();
    }

    if (data['temp-current-card']) {
      this._tempCurrentCard = deepClone(data['temp-current-card']);
      if (this._tempCurrentCard) {
        this.correct(this._tempCurrentCard);
      }
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
    await window.electron.ipcRenderer.writeJsonFile('card_editor_data', JSON.stringify(data));
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

  public async resetCurrentCard() {
    this._currentCard = this.getDefaultCurrentCard();
    await app.$indexedDB.save<CardStorageKey, ICard>('current-card', this._currentCard);
    this.fireCurrentCardUpdated();
  }

  public async convertCurrentCard() {
    if (!this._currentCard) return;
    this._currentCard = this.convertCard(this._currentCard);
    await this.saveCurrentCard(this._currentCard);
  }

  public async convertTempCurrentCard() {
    if (!this._tempCurrentCard) return;
    this._tempCurrentCard = this.convertCard(this._tempCurrentCard);
    await this.saveCurrentCard(this._tempCurrentCard);
  }

  private convertCard(card: ICard) {
    if (card.rush) {
      card.rush = false;
      return card;
    } else {
      card.rush = true;
      return card;
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

  public async importArtwork(url: string, path?: string) {
    path = path || await window.electron.ipcRenderer.getDirectoryPath();
    if (!path) return;
    return await window.electron.ipcRenderer.download(path, url);
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
        keepRatio: false
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

  public getDefaultImportCard(): ICard {
    return {
      language: 'en',
      name: '',
      nameStyle: 'default',
      tcgAt: false,
      artwork: {
        url: '',
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        pendulum: false,
        keepRatio: false
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
      unit: '%'
    };
  }

  public getFullPendulumCardPreset(): Crop {
    return {
      x: 7.15,
      y: 18.25,
      width: 85.75,
      height: 44,
      unit: '%'
    };
  }

  public generatePasscode() {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result = `${result}${Math.floor(Math.random() * 10)}`;
    }
    return result;
  }

  public getStIconName(icon: TStIcon) {
    switch (icon) {
      case 'normal': return 'Normal';
      case 'continuous': return 'Continu';
      case 'counter': return 'Contre';
      case 'equip': return 'Équipement';
      case 'field': return 'Terrain';
      case 'link': return 'Lien';
      case 'quickplay': return 'Jeu-Rapide';
      case 'ritual': return 'Rituel';
      default: return 'Inconnu';
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
      case 'dark': return 'TÉNÈBRES';
      case 'light': return 'LUMIÈRE';
      case 'water': return 'EAU';
      case 'earth': return 'TERRE';
      case 'wind': return 'VENT';
      case 'fire': return 'FEU';
      case 'divine': return 'DIVIN';
      case 'spell': return 'MAGIE';
      case 'trap': return 'PIÈGE';
      default: return 'INCONNU';
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

  public hasMaterials(card: ICard): boolean {
    if (!card.frames?.length) return false;

    for (let frame of card.frames) {
      if (
        frame === 'fusion' ||
        frame === 'synchro' ||
        frame === 'darkSynchro' ||
        frame === 'xyz' ||
        frame === 'link'
      ) {
        return true;
      }
    }

    return false;
  }

  public hasLinkArrows(card: ICard): boolean {
    for (let frame of card.frames) {
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

    for (let frame of card.frames) {
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

  public isOnlySkill(card: ICard) {
    return card.frames.length === 1 && card.frames.includes('skill');
  }
}
