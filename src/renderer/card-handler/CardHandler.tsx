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
        name: '',
        nameStyle: 'default',
        artwork: {
          url: '',
          x: 0,
          y: 0,
          height: 0,
          width: 0
        },
        frame: 'effect',
        stType: 'none',
        attribute: 'dark',
        abilities: [],
        level: 0,
        atk: 0,
        def: 0,
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
        passcode: -1,
        sticker: 'none',
        copyright: false,
        oldCopyright: false,
        speed: false,
        rush: false,
        legend: false,
        atkMax: 0
      }
    }
  }

  public render() {
    return this.renderAttributes(<HorizontalStack>
      <CardEditor />
      <CardPreview card={this.state.card} />
      <BatchDisplay />
    </HorizontalStack>, 'card-handler');
  }
}
