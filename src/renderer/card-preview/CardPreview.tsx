/* eslint-disable react/no-array-index-key */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-curly-brace-presence */
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
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { Fragment } from 'react';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  textResized: boolean,

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

  nameFontSize: number;
  descFontSize: number;
  descLineHeight: number;
  pendFontSize: number;
  pendLineHeight: number;

  attribute: string;
  level: string;
  negativeLevel: string;
  rank: string;
  linkRating: string;
  spellPlus: string;
  trapPlus: string;
  stIcon: string;

  atkDefLine: string;
  atkLinkLine: string;
  sticker: string;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> {

  public constructor(props: ICardPreviewProps) {
    super(props);

    const card = props.card;
    const hasPendulumFrame = card.pendulum
      && card.frame !== 'token'
      && card.frame !== 'spell'
      && card.frame !== 'trap'
      && card.frame !== 'skill'
      && card.frame !== 'legendaryDragon';

    this.state = {
      loaded: true,
      textResized: false,

      hasPendulumFrame,
      hasLinkArrows: card.frame === 'link' || card.stType === 'link',
      defaultTextColor: card.frame === 'xyz' || card.frame === 'link' ? 'white' : 'black',

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

      nameFontSize: 30,
      descFontSize: 23,
      descLineHeight: 1.2,
      pendFontSize: 23,
      pendLineHeight: 1.2,

      attribute: require(`../resources/pictures/attributes/${card.attribute}.png`),
      level: require(`../resources/pictures/levels/${card.level}.png`),
      negativeLevel: require(`../resources/pictures/negative-levels/${card.level}.png`),
      rank: require(`../resources/pictures/ranks/${card.level}.png`),
      linkRating: require(`../resources/pictures/link-ratings/${card.level}.png`),
      spellPlus: require(`../resources/pictures/st/spell+.png`),
      trapPlus: require(`../resources/pictures/st/trap+.png`),
      stIcon: require(`../resources/pictures/st/${card.stType}${card.stType === 'normal' ? card.frame === 'spell' ? '-spell' : '-trap' : '' }.png`),

      atkDefLine: require(`../resources/pictures/atkDefLine.png`),
      atkLinkLine: require(`../resources/pictures/atkLinkLine.png`),
      sticker: require(`../resources/pictures/stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
    };
  }

  public static getDerivedStateFromProps(nextProps: ICardPreviewProps, _prevState: ICardPreviewState) {
    const card = nextProps.card;
    const hasPendulumFrame = card.pendulum
      && card.frame !== 'token'
      && card.frame !== 'spell'
      && card.frame !== 'trap'
      && card.frame !== 'skill'
      && card.frame !== 'legendaryDragon';

    return {
      loaded: true,

      hasLinkArrows: card.frame === 'link' || card.stType === 'link',
      defaultTextColor: card.frame === 'xyz' || card.frame === 'link' ? 'white' : 'black',

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
      stIcon: require(`../resources/pictures/st/${card.stType}${card.stType === 'normal' ? card.frame === 'spell' ? '-spell' : '-trap' : '' }.png`),

      sticker: require(`../resources/pictures/stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
    };
  }

  public componentDidMount() {
    setTimeout(() => this.adjustDescFontSize(), 500);
  }

  public componentDidUpdate() {
    this.adjustDescFontSize();
  }

  public adjustDescFontSize() {
    const container = document.querySelector('.card-description')as HTMLDivElement;
    const text = document.querySelector('.description-text') as HTMLDivElement;
    if (!container || !text || this.state.descFontSize === 0) return;

    const textHeight = text.clientHeight;
    const parentHeight = container.offsetHeight;
    const fontSize = this.state.descFontSize;
    const textWidth = text.offsetWidth;

    if (textHeight > parentHeight || textWidth > container.offsetWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 1) {
        this.setState({ textResized: false, descFontSize: newFontSize, descLineHeight: newLineHeight });
      }
    } else if (!this.state.textResized) {
      this.setState({ textResized: true });
    }
  }


  public render() {
    let artworkClass = 'card-layer artwork';
    if (this.props.card.pendulum) {
      if (this.props.card.frame === 'link') {
        artworkClass = `${artworkClass} artwork-pendulum-link`;
      } else {
        artworkClass = `${artworkClass} artwork-pendulum`;
      }
    }

    return this.renderAttributes(<Container>
      <img className='card-layer border' src={this.state.border} alt='border' />

      <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
      <img className={artworkClass} src={this.state.artwork} alt='artwork' />

      <img className='card-layer card-frame' src={this.state.cardFrame} alt='cardFrame' />
      {this.state.hasPendulumFrame && <img className='card-layer pendulum-frame' src={this.state.pendulumFrame} alt='pendulumFrame' />}

      {this.state.hasLinkArrows && this.renderLinkArrows()}

      <img className='card-layer attribute' src={this.state.attribute} alt='attribute' />
      {this.renderLevelOrStIcon()}
      {this.renderStPlus()}

      {this.props.card.frame === 'link'
        ? <img className='card-layer atk-link-line' src={this.state.atkLinkLine} alt='atkLinkLine' />
        : <img className='card-layer atk-def-line' src={this.state.atkDefLine} alt='atkDefLine' />}

      {this.props.card.sticker !== 'none' && <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />}

      {this.hasAbilities && this.renderAbilities()}
      {this.renderDescription()}
    </Container>, 'card-preview');
  }

  private get hasAbilities(): boolean {
    return this.props.card.frame !== 'token'
      && this.props.card.frame !== 'spell'
      && this.props.card.frame !== 'trap'
      && this.props.card.frame !== 'skill'
      && this.props.card.frame !== 'legendaryDragon';
  }

  private renderAbilities() {
    let text = this.props.card.abilities.join(' / ');
    const upperCaseIndexes = text.split('').map((char, index) => char === char.toUpperCase() ? index : -1).filter(i => i !== -1);
    const lowerCaseText = text.toLowerCase();

    return this.renderAttributes(<HorizontalStack>
      <p className={`abilities-text black-text abilities-bracket left-bracket`}>{'['}</p>
      <p style={{}} className={`abilities-text black-text abilities`}>
        {upperCaseIndexes.map((index, i) => (
          <Fragment key={i}>
            <span className='uppercase'>
              {text.slice(index, index+1)}
            </span>
            <span className='lowercase'>
              {lowerCaseText.slice(index+1, upperCaseIndexes[i+1] || text.length)}
            </span>
          </Fragment>
        ))}
      </p>
      <p style={{}} className={`abilities-text black-text abilities-bracket right-bracket`}>{']'}</p>
    </HorizontalStack>, `card-layer card-abilities`);
  }

  private renderDescription() {
    let containerClass = `card-layer card-description ${this.state.textResized ? '' : 'hidden'}`;
    if (this.hasAbilities) containerClass = `${containerClass} with-abilities`;

    return this.renderAttributes(<Container>
      <p style={{ fontSize: `${this.state.descFontSize}px`, lineHeight: this.state.descLineHeight }} className={`description-text black-text`}>
        {this.props.card.description}
      </p>
    </Container>, containerClass);
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
    </Container>, 'card-layer card-link-arrows');
  }
}
