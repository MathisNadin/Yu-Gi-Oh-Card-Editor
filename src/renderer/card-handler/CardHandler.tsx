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
import { ICard } from './ICard';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  card: ICard;
}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> {

  public constructor(props: ICardHandlerProps) {
    super(props);

    this.state = {
      loaded: true,
      card: {
        name: 'Dragon Pare-Feu',
        nameStyle: 'default',
        artwork: {
          url: '',
          x: 0,
          y: 0,
          height: 0,
          width: 0
        },
        frame: 'effect',
        stType: 'link',
        attribute: 'light',
        abilities: ['Cyberse', 'Lien', 'Effet'],
        level: 4,
        atk: 2500,
        def: 2500,
        description: `2+ monstres nombre de monstres co-liés à cette carte ; renvoyez-les à la main. Si un monstre pointé par cette carte est détruit au combat ou envoyé au Cimetière : vous pouvez Invoquer Spécialement 1 monstre Cyberse depuis votre main. Vous ne pouvez utiliser chaque effet de "Dragon Pare-Feu" qu'une fois par tour.`,
        pendulum: false,
        pendEffect: `2+ monstres nombre de monstres co-liés à cette carte ; renvoyez-les à la main. Si un monstre pointé par cette carte est détruit au combat ou envoyé au Cimetière : vous pouvez Invoquer Spécialement 1 monstre Cyberse depuis votre main. Vous ne pouvez utiliser chaque effet de "Dragon Pare-Feu" qu'une fois par tour.`,
        scales: {
          left: 10,
          right: 1
        },
        linkArrows: {
          top: true,
          bottom: true,
          left: true,
          right: true,
          topLeft: false,
          topRight: false,
          bottomLeft: false,
          bottomRight: false
        },
        edition: 'limited',
        cardSet: 'COTD-FR045',
        passcode: '91875164',
        sticker: 'silver',
        hasCopyright: true,
        oldCopyright: false,
        speed: false,
        rush: false,
        legend: false,
        atkMax: 0
      }
    }
  }

  public render() {
    return this.renderAttributes(<HorizontalStack gutter>
      <CardEditor card={this.state.card} onCardChange={card => this.setState({ card })} />
      <CardPreview card={this.state.card} />
      <BatchDisplay />
    </HorizontalStack>, 'card-handler');
  }
}
