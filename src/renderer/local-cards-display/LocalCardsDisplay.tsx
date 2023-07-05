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
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import './styles.css';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { ICard, ICardListener, TFrame } from 'renderer/card/CardService';

export type CardSortOptions = 'name' | 'frame' | 'created' | 'modified';

interface ILocalCardsDisplayProps extends IContainableProps {
}

interface ILocalCardsDisplayState extends IContainableState {
  localCards: ICard[];
  sortOption: CardSortOptions;
  frameOrder: TFrame[];
}

export class LocalCardsDisplay extends Containable<ILocalCardsDisplayProps, ILocalCardsDisplayState> implements Partial<ICardListener> {

  public constructor(props: ILocalCardsDisplayProps) {
    super(props);
    this.state = {
      loaded: true,
      sortOption: 'created',
      localCards: app.$card.localCards,
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
    this.setLocalCards();
    app.$card.addListener(this);
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public localCardsLoaded(localCards: ICard[]) {
    this.setState({ localCards });
    this.setLocalCards();
  }

  public localCardsUpdated(localCards: ICard[]) {
    this.setState({ localCards });
    this.setLocalCards();
  }

  private setLocalCards() {
    let localCards = this.state.localCards;
    switch (this.state?.sortOption) {
      case 'name':
        localCards.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'frame':
        localCards.sort((a, b) => this.state.frameOrder.indexOf(a.frame) - this.state.frameOrder.indexOf(b.frame));
        break;

      case 'created':
        localCards.sort((a, b) => (a.created as Date).getTime() - (b.created as Date).getTime());
        break;

      case 'modified':
        localCards.sort((a, b) => (a.modified as Date).getTime() - (b.modified as Date).getTime());
        break;

      default:
        break;
    }
    this.setState({ localCards });
  }

  private sort(sortOption: CardSortOptions) {
    this.setState({ sortOption });
    this.setLocalCards();
  }

  private formatDate(date: Date | undefined) {
    if (!date) return 'Inconnu';

    let day = `${date.getDay()}`;
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

  public render() {
    return this.renderAttributes(<VerticalStack>
      <VerticalStack scroll fill className='local-cards-listing'>
        <p className='local-cards-label'>Cartes locales</p>
        <table className='table'>
          <thead>
            <tr>
              <th onClick={() => this.sort('name')}>Nom</th>
              <th onClick={() => this.sort('frame')}>Type</th>
              <th onClick={() => this.sort('created')}>Créée le</th>
              <th onClick={() => this.sort('modified')}>Modifiée le</th>
            </tr>
          </thead>
          <tbody>
            {this.state?.localCards?.map((card, index) => (
              <tr key={index}>
                <td>{card.name}</td>
                <td>{app.$card.getFrameName(card.frame)}</td>
                <td>{this.formatDate(card.created)}</td>
                <td>{this.formatDate(card.modified)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VerticalStack>
    </VerticalStack>, 'local-cards-display');
  }
};
