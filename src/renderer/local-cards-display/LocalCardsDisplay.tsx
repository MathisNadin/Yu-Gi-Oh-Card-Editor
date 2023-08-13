/* eslint-disable no-else-return */
/* eslint-disable import/order */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-const */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
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
import './styles.css';
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { ICardListener } from 'renderer/card/CardService';
import { classNames, deepClone, uuid } from 'mn-toolkit/tools';
import { MouseEvent } from 'react';
import check from '../resources/pictures/check.svg';
import edit from '../resources/pictures/edit.svg';
import cross from '../resources/pictures/cross.svg';
import trash from '../resources/pictures/trash.svg';
import { ICard, TFrame } from 'renderer/card/card-interfaces';

export type CardSortOptions = 'name' | 'frame' | 'created' | 'created-reverse' | 'modified' | 'modified-reverse' | 'game' | 'game-reverse';

interface ILocalCardsDisplayProps extends IContainableProps {}

interface ILocalCardsDisplayState extends IContainableState {
  localCards: ICard[];
  sortOption: CardSortOptions;
  frameOrder: TFrame[];
  current: string;
  edited: string;
  selectedCards: { [cardUuid: string]: boolean };
}

export class LocalCardsDisplay extends Containable<ILocalCardsDisplayProps, ILocalCardsDisplayState> implements Partial<ICardListener> {

  public constructor(props: ILocalCardsDisplayProps) {
    super(props);
    this.state = {
      loaded: true,
      current: app.$card.tempCurrentCard?.uuid as string,
      edited: app.$card.tempCurrentCard?.uuid as string,
      sortOption: 'modified',
      localCards: app.$card.localCards,
      selectedCards: {},
      frameOrder: [
        'obelisk',
        'slifer',
        'ra',
        'normal',
        'effect',
        'ritual',
        'fusion',
        'synchro',
        'darkSynchro',
        'xyz',
        'link',
        'monsterToken',
        'token',
        'legendaryDragon',
        'spell',
        'trap',
        'skill'
      ]
    };
    this.sort();
    app.$card.addListener(this);
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public localCardsLoaded(localCards: ICard[]) {
    this.sort(localCards);
  }

  public localCardsUpdated(localCards: ICard[]) {
    this.sort(localCards);
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    this.setState({ edited: tempCurrentCard.uuid as string, current: tempCurrentCard.uuid as string });
  }

  public menuSaveTempToLocal() {
    this.setState({ edited: '', current: '' });
  }

  private sort(localCards?: ICard[], sortOption?: CardSortOptions) {
    sortOption = sortOption || this.state?.sortOption;
    localCards = localCards || this.state?.localCards;
    switch (sortOption) {
      case 'name':
        localCards.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'frame':
        localCards.sort((a, b) => this.state.frameOrder.indexOf(a.frames[0]) - this.state.frameOrder.indexOf(b.frames[0]));
        break;

      case 'created':
        localCards.sort((a, b) => (a.created as Date).getTime() - (b.created as Date).getTime());
        break;

      case 'created-reverse':
        localCards.sort((a, b) => (b.created as Date).getTime() - (a.created as Date).getTime());
        break;

      case 'modified':
        localCards.sort((a, b) => (a.modified as Date).getTime() - (b.modified as Date).getTime());
        break;

      case 'modified-reverse':
        localCards.sort((a, b) => (b.modified as Date).getTime() - (a.modified as Date).getTime());
        break;

      case 'game':
        localCards.sort((a, b) => {
          let aScore = a.rush ? 0 : 1;
          let bScore = b.rush ? 0 : 1;
          return aScore - bScore;
        });
        break;

      case 'game-reverse':
        localCards.sort((a, b) => {
          let aScore = a.rush ? 1 : 0;
          let bScore = b.rush ? 1 : 0;
          return aScore - bScore;
        });
        break;

      default:
        break;
    }
    this.setState({ sortOption, localCards });
    this.forceUpdate();
  }

  private formatDate(date: Date | undefined) {
    if (!date) return 'Inconnu';

    let day = `${date.getDate()}`;
    if (day.length < 2) {
      day = `0${day}`;
    }

    let month = `${date.getMonth()}`;
    if (month.length < 2) {
      month = `0${month}`;
    }

    let hours = `${date.getHours()}`;
    if (hours.length < 2) {
      hours = `0${hours}`;
    }

    let minutes = `${date.getMinutes()}`;
    if (minutes.length < 2) {
      minutes = `0${minutes}`;
    }

    return `${day}/${month}/${date.getFullYear()} ${hours}h${minutes}`;
  }

  private async saveEdit(event: MouseEvent) {
    if (event) event.stopPropagation();
    this.setState({ edited: '', current: '' });
    await app.$card.saveTempCurrentToLocal();
  }

  private async startEdit(event: MouseEvent, card: ICard) {
    if (event) event.stopPropagation();
    this.setState({ edited: card.uuid as string, current: card.uuid as string });
    await app.$card.saveTempCurrentCard(deepClone(card));
  }

  private async abordEdit(event: MouseEvent) {
    if (event) event.stopPropagation();
    this.setState({ edited: '', current: '' });
    await app.$card.saveTempCurrentCard(undefined);
  }

  private async deleteCard(event: MouseEvent, card: ICard) {
    if (event) event.stopPropagation();
    await app.$card.deleteLocalCard(card);
  }

  private async renderSelectedCards() {
    if (this.state.edited) return;

    let cards = this.state.localCards.filter(c => this.state.selectedCards[c.uuid as string]);
    if (!cards.length) return;

    await app.$card.renderCards(cards);
    this.setState({ selectedCards: {} });
  }

  private toggleSelectCard(cardUuid: string) {
    let selectedCards = this.state.selectedCards;
    selectedCards[cardUuid] = !selectedCards[cardUuid];
    this.setState({ selectedCards });
  }

  public render() {
    return this.renderAttributes(<VerticalStack>
      <VerticalStack scroll fill className='local-cards-listing'>
        <p className='local-cards-label'>Cartes locales</p>

        <table className='table'>
          <thead>
            <tr>
              <th
                className={classNames('cursor-pointer', { 'sorted-asc': this.state.sortOption === 'game' }, { 'sorted-desc': this.state.sortOption === 'game-reverse' })}
                onClick={() => this.sort(this.state.localCards, this.state.sortOption === 'game' ? 'game-reverse' : 'game')}
              >Créée</th>
              <th className='cursor-pointer' onClick={() => this.sort(this.state.localCards, 'name')}>Nom</th>
              <th className='cursor-pointer' onClick={() => this.sort(this.state.localCards, 'frame')}>Type</th>
              <th
                className={classNames('cursor-pointer', { 'sorted-asc': this.state.sortOption === 'created' }, { 'sorted-desc': this.state.sortOption === 'created-reverse' })}
                onClick={() => this.sort(this.state.localCards, this.state.sortOption === 'created' ? 'created-reverse' : 'created')}
              >Créée</th>
              <th
                className={classNames('cursor-pointer', { 'sorted-asc': this.state.sortOption === 'modified' }, { 'sorted-desc': this.state.sortOption === 'modified-reverse' })}
                onClick={() => this.sort(this.state.localCards, this.state.sortOption === 'modified' ? 'modified-reverse' : 'modified')}
              >Modifiée</th>
              <th className='empty empty-1'> </th>
              <th className='empty empty-2'> </th>
            </tr>
          </thead>
          <tbody>
            {this.state?.localCards?.map(card => {
              const isEdited = this.state.edited === card.uuid;
              const isCurrent = this.state.current === card.uuid;
              return <tr key={uuid()} className={classNames('local-card-row', { 'selected': this.state.selectedCards[card.uuid as string] }, { 'current': isCurrent })}>
                <td onClick={() => this.toggleSelectCard(card.uuid as string)}>{card.rush ? 'Rush' : 'Master'}</td>
                <td onClick={() => this.toggleSelectCard(card.uuid as string)}>{card.name}</td>
                <td onClick={() => this.toggleSelectCard(card.uuid as string)}>{app.$card.getFramesNames(card.frames)}</td>
                <td onClick={() => this.toggleSelectCard(card.uuid as string)}>{this.formatDate(card.created)}</td>
                <td onClick={() => this.toggleSelectCard(card.uuid as string)}>{this.formatDate(card.modified)}</td>
                <td className={classNames('with-icon', { 'current': isCurrent })}>{isEdited
                  ? <img src={check} alt='check' className='check' onClick={e => app.$errorManager.handlePromise(this.saveEdit(e))} />
                  : <img src={edit} alt='edit' className='edit' onClick={e => app.$errorManager.handlePromise(this.startEdit(e, card))} />
                }</td>
                <td className={classNames('with-icon', { 'current': isCurrent })}>{isEdited
                  ? <img src={cross} alt='cross' className='cross' onClick={e => app.$errorManager.handlePromise(this.abordEdit(e))} />
                  : <img src={trash} alt='trash' className='trash' onClick={e => app.$errorManager.handlePromise(this.deleteCard(e, card))} />
                }</td>
              </tr>;
            })}
          </tbody>
        </table>
      </VerticalStack>

      <button
        type='button'
        className={classNames('render-cards-btn', { 'disabled': this.state.edited || !Object.values(this.state.selectedCards).filter(s => !!s).length })}
        onClick={() => app.$errorManager.handlePromise(this.renderSelectedCards())}
      >Faire le rendu des cartes</button>
    </VerticalStack>, 'local-cards-display');
  }
};
