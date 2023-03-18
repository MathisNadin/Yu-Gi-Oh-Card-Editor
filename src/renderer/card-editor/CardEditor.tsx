/* eslint-disable prefer-const */
/* eslint-disable prefer-destructuring */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable global-require */
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
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { ICard, TFrame } from 'renderer/card-handler/ICard';

interface ICardEditorProps extends IContainableProps {
  card: ICard;
  onCardChange: (card: ICard) => void;
}

interface ICardEditorState extends IContainableState {
  cardFrames: {
    id: TFrame;
    file: string;
  }[];
  selectedFrame: TFrame;
}

export class CardEditor extends Containable<ICardEditorProps, ICardEditorState>{

  public constructor(props: ICardEditorProps) {
    super(props);

    this.state = {
      loaded: true,
      cardFrames: [
        { id: 'normal', file: require(`../resources/pictures/card-frames/normal.png`)},
        { id: 'effect', file: require(`../resources/pictures/card-frames/effect.png`)},
        { id: 'ritual', file: require(`../resources/pictures/card-frames/ritual.png`)},
        { id: 'fusion', file: require(`../resources/pictures/card-frames/fusion.png`)},
        { id: 'synchro', file: require(`../resources/pictures/card-frames/synchro.png`)},
        { id: 'darkSynchro', file: require(`../resources/pictures/card-frames/darkSynchro.png`)},
        { id: 'xyz', file: require(`../resources/pictures/card-frames/xyz.png`)},
        { id: 'link', file: require(`../resources/pictures/card-frames/link.png`)},
        { id: 'spell', file: require(`../resources/pictures/card-frames/spell.png`)},
        { id: 'trap', file: require(`../resources/pictures/card-frames/trap.png`)},
        { id: 'monsterToken', file: require(`../resources/pictures/card-frames/monsterToken.png`)},
        { id: 'token', file: require(`../resources/pictures/card-frames/token.png`)},
        { id: 'obelisk', file: require(`../resources/pictures/card-frames/obelisk.png`)},
        { id: 'slifer', file: require(`../resources/pictures/card-frames/slifer.png`)},
        { id: 'ra', file: require(`../resources/pictures/card-frames/ra.png`)},
        { id: 'legendaryDragon', file: require(`../resources/pictures/card-frames/legendaryDragon.png`)},
        { id: 'skill', file: require(`../resources/pictures/card-frames/skill.png`)},
      ],
      selectedFrame: props.card.frame
    }
  }

  public onFrameChange(selectedFrame: TFrame) {
    let card = this.props.card;
    card.frame = selectedFrame;
    this.setState({ selectedFrame });
    if (this.props.onCardChange) this.props.onCardChange(card);
  }

  public render() {
    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='card-editor-section card-frames'>
        <p className='card-frames-label label-with-separator'>Type de carte</p>
        <HorizontalStack className='card-frames-icons'>
          {this.state.cardFrames.map(frame =>
            <HorizontalStack className='card-frame-container'>
              <img src={frame.file}
                alt={`frame-${frame.id}`}
                className={`card-frame${this.state.selectedFrame === frame.id ? ' selected' : ''}`}
                onClick={() => this.onFrameChange(frame.id)} />
            </HorizontalStack>
          )}
        </HorizontalStack>
      </VerticalStack>

{/*       <VerticalStack className='card-editor-section card-frames'>
        <p className='card-frames-label'>Type de carte</p>
        <HorizontalStack className='card-frames-icons'>
          {this.state.cardFrames.map(frame =>
            <img src={frame.file}
              alt={`frame-${frame.id}`}
              className={`card-frame${this.state.selectedFrame === frame.id ? ' selected' : ''}`}
              onClick={() => this.setState({ selectedFrame: frame.id })} />
          )}
        </HorizontalStack>
      </VerticalStack> */}
    </VerticalStack>, 'card-editor');
  }
};
