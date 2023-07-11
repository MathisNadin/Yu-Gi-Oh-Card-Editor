/* eslint-disable no-else-return */
/* eslint-disable no-plusplus */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-const */
/* eslint-disable import/order */
/* eslint-disable no-undef */
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
import { LocalCardsDisplay } from 'renderer/local-cards-display/LocalCardsDisplay';
import { CardEditor } from 'renderer/card-editor/CardEditor';
import { CardPreview } from 'renderer/card-preview/CardPreview';
import { ICardListener } from '../card/CardService';
import { Spinner } from 'mn-toolkit/spinner/Spinner';
import { ICard } from 'renderer/card/card-interfaces';
import { classNames } from 'mn-toolkit/tools';
import { CSSProperties } from 'react';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  currentCard: ICard;
  tempCurrentCard: ICard;
}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> implements Partial<ICardListener> {
  private border = require('../resources/pictures/squareBorders.png');
  private frames = [
    require(`../resources/pictures/card-frames/effect.png`),
    // require(`../resources/pictures/card-frames/ritual.png`),
    require(`../resources/pictures/card-frames/fusion.png`),
    require(`../resources/pictures/card-frames/synchro.png`),
    require(`../resources/pictures/card-frames/xyz.png`),
    // require(`../resources/pictures/card-frames/link.png`),
  ];

  public constructor(props: ICardHandlerProps) {
    super(props);
    app.$card.addListener(this);
    this.state = { loaded: false } as ICardHandlerState;
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public currentCardLoaded(currentCard: ICard) {
    this.setState({ loaded: true, currentCard });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ currentCard });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    this.setState({ loaded: true, tempCurrentCard });
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    this.setState({ tempCurrentCard });
  }

  private async onCardChange(card: ICard) {
    if (this.state.tempCurrentCard) {
      await app.$card.saveTempCurrentCard(card)
    } else {
      await app.$card.saveCurrentCard(card);
    }
  }

  private generateArrayOdd(num: number): number[] {
    if (num <= 0 || num % 2 === 0) {
      throw new Error("Le nombre doit être un nombre impair positif.");
    }

    const array: number[] = [];
    let sum = 0;
    let middleIndex: number;

    middleIndex = Math.floor(num / 2);
    for (let i = 0; i < num; i++) {
      let value: number;
      if (i === middleIndex) {
        value = 1;
      } else {
        const distanceFromMiddle = Math.abs(i - middleIndex);
        value = 1 / (1.4 ** distanceFromMiddle);
      }

      array.push(value);
      sum += value;
    }

    const scaleFactor = 100 / sum;
    const scaledArray = array.map(value => value * scaleFactor);
    return scaledArray;
  }

  private generateArrayEven(num: number): number[] {
    if (num <= 0 || num % 2 !== 0) {
      throw new Error("Le nombre doit être un nombre pair positif.");
    }

    const array: number[] = [];
    let sum = 0;
    let middleIndex: number;

    middleIndex = num / 2;
    for (let i = 1; i <= middleIndex; i++) {
      const distanceFromMiddle = i - 0.5;
      const multiplier = 1.4 ** (middleIndex - distanceFromMiddle);
      const value = multiplier * 100 / ((1.4 ** middleIndex) * 2 - 1);
      array.unshift(value); // Ajouter à gauche
      array.push(value); // Ajouter à droite
      sum += 2 * value;
    }

    const scaleFactor = 100 / sum;
    const scaledArray = array.map(value => value * scaleFactor);
    return scaledArray;
  }


/*   public render() {
    if (!this.state?.loaded) return <Spinner />;
    const styleArray = this.generateArray(this.frames.length);
    console.log(styleArray);
    const card = this.state.tempCurrentCard || this.state.currentCard;
    return this.renderAttributes(<HorizontalStack gutter>
      <HorizontalStack className='frames-stack'>
        {this.frames.map((image, index) => {
        const style: CSSProperties = {};
        if (index) style.clipPath = `polygon(100% 0%, ${styleArray[index]} 0%, 50% 50%, ${styleArray[index]} 100%, 100% 100%)`;
        console.log(styleArray[index], style.clipPath);
          return <div className="image-wrapper" key={index}>
            <img style={style} className={classNames('card-frame', 'card-frame-test', `frame-${index}`)} src={image} alt='frame' />
          </div>;
        })}
        <img className={classNames('card-frame', 'card-border-test')} src={this.border} alt='borders' />
      </HorizontalStack>
    </HorizontalStack>, 'card-handler');
  } */


  public render() {
    if (!this.state?.loaded) return <Spinner />;
    const card = this.state.tempCurrentCard || this.state.currentCard;
    return this.renderAttributes(<HorizontalStack gutter>
      <CardEditor card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />
      <CardPreview card={card} />
      <LocalCardsDisplay />
    </HorizontalStack>, 'card-handler');
  }
}
