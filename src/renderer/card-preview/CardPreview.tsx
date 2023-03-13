/* eslint-disable no-else-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
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
import { Container } from 'mn-toolkit/container/Container';
import { ICard } from 'renderer/card-handler/ICard';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  hasPendulumFrame: boolean;
  hasLinkArrows: boolean;
  defaultTextColor: 'black' | 'white';

  border: string;
  artworkBg: string;
  artwork: string;

  cardFrame: string;
  pendulumFrame: string;

  linkArrowT: string;
  linkArrowB: string;
  linkArrowL: string;
  linkArrowR: string;
  linkArrowTL: string;
  linkArrowTR: string;
  linkArrowBL: string;
  linkArrowBR: string;

  attribute: string;
  level: string;
  negativeLevel: string;
  rank: string;
  linkRating: string;
  spellPlus: string;
  trapPlus: string;
  stIcon: string;

  sticker: string;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> {

  public constructor(props: ICardPreviewProps) {
    super(props);

    const card = props.card;
    const hasPendulumFrame = this.hasPendulumFrame(card);
    this.state = {
      loaded: true,

      hasPendulumFrame,
      hasLinkArrows: card.frame === 'link' || card.stType === 'link',
      defaultTextColor: card.frame === 'xyz' ? 'white' : 'black',

      border: require('../resources/pictures/squareBorders.png'),
      artworkBg: require(`../resources/pictures/whiteArtwork${card.pendulum ? `Pendulum${card.frame === 'link' ? 'Link' : ''}` : '' }.png`),
      artwork: card.artwork.url || require('../resources/pictures/artworkTest4.jpg'),

      cardFrame: require(`../resources/pictures/card-frames/${card.frame}.png`),
      pendulumFrame: require(`../resources/pictures/pendulum-frames/${card.frame}.png`),

      linkArrowT: require(`../resources/pictures/link-arrows/top${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowB: require(`../resources/pictures/link-arrows/bottom${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowL: require(`../resources/pictures/link-arrows/left${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowR: require(`../resources/pictures/link-arrows/right${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowTL: require(`../resources/pictures/link-arrows/topLeft${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowTR: require(`../resources/pictures/link-arrows/topRight${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowBL: require(`../resources/pictures/link-arrows/bottomLeft${hasPendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowBR: require(`../resources/pictures/link-arrows/bottomRight${hasPendulumFrame ? 'Pendulum' : ''}.png`),

      attribute: require(`../resources/pictures/attributes/${card.attribute}.png`),
      level: require(`../resources/pictures/levels/${card.level}.png`),
      negativeLevel: require(`../resources/pictures/negative-levels/${card.level}.png`),
      rank: require(`../resources/pictures/ranks/${card.level}.png`),
      linkRating: require(`../resources/pictures/link-ratings/${card.level}.png`),
      spellPlus: require(`../resources/pictures/st/spell+.png`),
      trapPlus: require(`../resources/pictures/st/trap+.png`),
      stIcon: require(`../resources/pictures/st/${card.stType}${card.stType === 'normal' ? card.frame === 'spell' ? '-spell' : '-trap' : '' }.png`),

      sticker: require(`../resources/pictures/stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
    };
  }

  private hasPendulumFrame(card: ICard): boolean {
    return card.pendulum
      && card.frame !== 'token'
      && card.frame !== 'spell'
      && card.frame !== 'trap'
      && card.frame !== 'skill'
      && card.frame !== 'legendaryDragon';
  }

  public static getDerivedStateFromProps(nextProps: ICardPreviewProps, _prevState: ICardPreviewState) {
    const card = nextProps.card;
    return {
    };
  }

  public render() {
    return this.renderAttributes(<Container>
      <img className='card-layer border' src={this.state.border} alt='border' />

      <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
      <img className='card-layer artwork' src={this.state.artwork} alt='artwork' />

      <img className='card-layer card-frame' src={this.state.cardFrame} alt='cardFrame' />
      {this.state.hasPendulumFrame && <img className='card-layer pendulum-frame' src={this.state.pendulumFrame} alt='pendulumFrame' />}

      {this.state.hasLinkArrows && this.renderLinkArrows()}

      <img className='card-layer attribute' src={this.state.attribute} alt='attribute' />
      {this.renderLevelOrStIcon()}
      {this.renderStPlus()}

      {this.props.card.sticker !== 'none' && <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />}
    </Container>, 'card-preview');
  }

  private renderStPlus() {
    if ((this.props.card.frame === 'spell' || this.props.card.frame === 'trap') && this.props.card.stType === 'normal') {
      return <img className='card-layer st-plus' src={this.props.card.frame === 'spell' ? this.state.spellPlus : this.state.trapPlus} alt='stPlus' />;
    }
    return null;
  }

  private renderLevelOrStIcon() {
    if (this.props.card.frame === 'spell' || this.props.card.frame === 'trap') {
      return <img className='card-layer st-icon' src={this.state.stIcon} alt='stIcon' />
    }
    else if (this.props.card.frame === 'darkSynchro') {
      return <img className='card-layer negative-level' src={this.state.negativeLevel} alt='negativeLevel' />
    }
    else if (this.props.card.frame === 'xyz') {
      return <img className='card-layer rank' src={this.state.rank} alt='rank' />
    }
    else if (this.props.card.frame === 'link') {
      return <img className='card-layer link-rating' src={this.state.linkRating} alt='linkRating' />
    }
    else if (this.props.card.frame !== 'skill' && this.props.card.frame !== 'token' && this.props.card.frame !== 'legendaryDragon') {
      return <img className='card-layer level' src={this.state.level} alt='level' />
    }
    return null;
  }

  private renderLinkArrows() {
    return this.renderAttributes(<Container>
      {this.props.card.linkArrows.top && <img className='card-layer link-arrow link-arrow-t' src={this.state.linkArrowT} alt='linkArrowT' />}
      {this.props.card.linkArrows.bottom && <img className='card-layer link-arrow link-arrow-b' src={this.state.linkArrowB} alt='linkArrowB' />}
      {this.props.card.linkArrows.left && <img className='card-layer link-arrow link-arrow-l' src={this.state.linkArrowL} alt='linkArrowL' />}
      {this.props.card.linkArrows.right && <img className='card-layer link-arrow link-arrow-r' src={this.state.linkArrowR} alt='linkArrowR' />}
      {this.props.card.linkArrows.topLeft && <img className='card-layer link-arrow link-arrow-tl' src={this.state.linkArrowTL} alt='linkArrowTL' />}
      {this.props.card.linkArrows.topRight && <img className='card-layer link-arrow link-arrow-tr' src={this.state.linkArrowTR} alt='linkArrowTR' />}
      {this.props.card.linkArrows.bottomLeft && <img className='card-layer link-arrow link-arrow-bl' src={this.state.linkArrowBL} alt='linkArrowBL' />}
      {this.props.card.linkArrows.bottomRight && <img className='card-layer link-arrow link-arrow-br' src={this.state.linkArrowBR} alt='linkArrowBR' />}
    </Container>, 'card-link-arrows');
  }
}
