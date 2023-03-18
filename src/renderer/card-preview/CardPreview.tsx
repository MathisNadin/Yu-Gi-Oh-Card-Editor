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
import html2canvas from 'html2canvas';
import { handlePromise } from 'mn-toolkit/error-manager/ErrorManager';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  adjustState: 'todo' | 'name' | 'pend' | 'abilities' | 'desc' | 'done';
  adjustTextState: 'unknown' | 'tooBig' | 'tooSmall';

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
  leftScale: string;
  rightScale: string;

  atkDefLine: string;
  atkLinkLine: string;
  sticker: string;
  copyright: string;
  edition: string;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> {

  public constructor(props: ICardPreviewProps) {
    super(props);
    this.handleResize = this.handleResize.bind(this);

    const card = props.card;
    const copyrightPath = `${card.copyrightYear}/${card.frame === 'xyz' ? 'white' : 'black'}`;
    const hasPendulumFrame = card.pendulum
      && card.frame !== 'token'
      && card.frame !== 'spell'
      && card.frame !== 'trap'
      && card.frame !== 'skill'
      && card.frame !== 'legendaryDragon';

    this.state = {
      loaded: true,
      adjustState: 'todo',
      adjustTextState: 'unknown',

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

      descFontSize: 18,
      descLineHeight: 1.2,
      pendFontSize: 18,
      pendLineHeight: 1.2,

      attribute: require(`../resources/pictures/attributes/${card.attribute}.png`),
      level: require(`../resources/pictures/levels/${card.level}.png`),
      negativeLevel: require(`../resources/pictures/negative-levels/${card.level}.png`),
      rank: require(`../resources/pictures/ranks/${card.level}.png`),
      linkRating: require(`../resources/pictures/link-ratings/${card.level}.png`),
      spellPlus: require(`../resources/pictures/st/spell+.png`),
      trapPlus: require(`../resources/pictures/st/trap+.png`),
      stIcon: require(`../resources/pictures/st/${card.stType}${card.stType === 'normal' ? card.frame === 'spell' ? '-spell' : '-trap' : '' }.png`),
      leftScale: require(`../resources/pictures/pendulum-scales/${card.frame === 'link' ? 'L_' : ''}G_${card.scales.left}.png`),
      rightScale: require(`../resources/pictures/pendulum-scales/${card.frame === 'link' ? 'L_' : ''}D_${card.scales.right}.png`),

      atkDefLine: require(`../resources/pictures/atkDefLine.png`),
      atkLinkLine: require(`../resources/pictures/atkLinkLine.png`),
      sticker: require(`../resources/pictures/stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
      copyright: require(`../resources/pictures/limitations/${copyrightPath}/copyright.png`),
      edition: require(`../resources/pictures/limitations/${copyrightPath}/${card.edition}.png`),
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
    };
  }

  public componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    setTimeout(() => handlePromise(this.adjustAllFontSizes()), 1000);
  }

  public componentDidUpdate() {
    handlePromise(this.adjustAllFontSizes());
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize() {
    handlePromise(this.adjustAllFontSizes());
  }

  private async adjustAllFontSizes() {
    switch (this.state.adjustState) {
      case 'todo': this.setState({ adjustState: 'name' }); break;
      case 'name': await this.convertNameToImg(); break;
      case 'pend': this.adjustPendFontSize(); break;
      case 'abilities': await this.convertAbilitiesToImg(); break;
      case 'desc': this.adjustDescFontSize(); break;
      default: break;
    }
  }

  private adjustPendFontSize() {
    if (!this.props.card.pendulum) {
      this.setState({ adjustState: 'abilities' });
      return;
    }

    const container = document.querySelector('.card-pendulum-effect') as HTMLDivElement;
    const text = document.querySelector('.pendulum-effect-text') as HTMLDivElement;
    if (!container || !text || this.state.pendFontSize === 0) {
      this.setState({ adjustState: 'abilities' });
      return;
    }

    const textHeight = text.clientHeight;
    const parentHeight = container.offsetHeight;
    const fontSize = this.state.pendFontSize;
    const textWidth = text.offsetWidth;

    if (textHeight > parentHeight || textWidth > container.offsetWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 1) {
        this.setState({ pendFontSize: newFontSize, pendLineHeight: newLineHeight, adjustTextState: 'tooBig' });
      } else {
        this.setState({ adjustState: 'abilities', adjustTextState: 'unknown' });
      }
    }
    else if (textHeight < parentHeight || textWidth < container.offsetWidth) {
      if (this.state.adjustTextState === 'tooBig') {
        if (this.state.pendLineHeight < 1.2) {
          let newLineHeight = this.state.pendLineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          this.setState({ pendLineHeight: newLineHeight });
        } else {
          this.setState({ adjustState: 'abilities', adjustTextState: 'unknown' });
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 18) {
          this.setState({ pendFontSize: newFontSize, pendLineHeight: newLineHeight, adjustTextState: 'tooSmall' });
        } else {
          this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
        }
      }
    }
    else {
      this.setState({ adjustState: 'abilities', adjustTextState: 'unknown' });
    }
  }

  public async convertNameToImg() {
    const container = document.querySelector('.card-name-container') as HTMLDivElement;
    if (!container) return;
    const abilities = container.querySelector('.card-name') as HTMLDivElement;
    if (!abilities) return;

    const canvas = await html2canvas(abilities, { backgroundColor: null });
    canvas.className = 'html2canvas-name';
    const existingCanvas = container.querySelector('.html2canvas-name');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      container.appendChild(canvas);
    }
    this.setState({ adjustState: 'pend' });
  }

  public async convertAbilitiesToImg() {
    const container = document.querySelector('.card-abilities') as HTMLDivElement;
    if (!container) return;
    const rightBracket = container.querySelector('.right-bracket') as HTMLDivElement;
    const abilities = container.querySelector('.abilities') as HTMLDivElement;
    if (!rightBracket || !abilities) return;

    const canvas = await html2canvas(abilities, { backgroundColor: null });
    canvas.className = 'html2canvas-abilities';
    const existingCanvas = container.querySelector('.html2canvas-abilities');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      container.insertBefore(canvas, rightBracket);
    }
    this.setState({ adjustState: 'desc' });
  }

  public adjustDescFontSize() {
    const container = document.querySelector('.card-description') as HTMLDivElement;
    const text = document.querySelector('.description-text') as HTMLDivElement;
    if (!container || !text || this.state.descFontSize === 0) {
      this.setState({ adjustState: 'done' });
      return;
    }

    const textHeight = text.clientHeight;
    const parentHeight = container.offsetHeight;
    const fontSize = this.state.descFontSize;
    const textWidth = text.offsetWidth;

    if (textHeight > parentHeight || textWidth > container.offsetWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 1) {
        this.setState({ descFontSize: newFontSize, descLineHeight: newLineHeight, adjustTextState: 'tooBig' });
      } else {
        this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
      }
    }
    else if (textHeight < parentHeight || textWidth < container.offsetWidth) {
      if (this.state.adjustTextState === 'tooBig') {
        if (this.state.descLineHeight < 1.2) {
          let newLineHeight = this.state.descLineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          this.setState({ descLineHeight: newLineHeight });
        } else {
          this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 18) {
          this.setState({ descFontSize: newFontSize, descLineHeight: newLineHeight, adjustTextState: 'tooSmall' });
        } else {
          this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
        }
      }
    }
    else {
      this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
    }
  }

  public render() {
    let artworkClass = 'card-layer artwork-container';
    if (this.props.card.pendulum) {
      if (this.props.card.frame === 'link') {
        artworkClass = `${artworkClass} artwork-pendulum-link`;
      } else {
        artworkClass = `${artworkClass} artwork-pendulum`;
      }
    }

    return this.renderAttributes(<Container>
      <img className='card-layer border' src={this.state.border} alt='border' />

      {this.state.hasPendulumFrame && <img className='card-layer card-frame' src={this.state.cardFrame} alt='cardFrame' />}
      <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
      {this.renderAttributes(<div><img className='artwork' src={this.state.artwork} alt='artwork' /></div>, artworkClass)}

      {!this.state.hasPendulumFrame && <img className='card-layer card-frame' src={this.state.cardFrame} alt='cardFrame' />}
      {this.state.hasPendulumFrame && <img className='card-layer pendulum-frame' src={this.state.pendulumFrame} alt='pendulumFrame' />}

      {this.state.hasLinkArrows && this.renderLinkArrows()}

      <img className='card-layer attribute' src={this.state.attribute} alt='attribute' />
      {this.renderLevelOrStIcon()}
      {this.renderStPlus()}

      {this.props.card.frame === 'link'
        ? <img className='card-layer atk-link-line' src={this.state.atkLinkLine} alt='atkLinkLine' />
        : <img className='card-layer atk-def-line' src={this.state.atkDefLine} alt='atkDefLine' />}

      {this.props.card.sticker !== 'none' && <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />}
      {this.props.card.edition !== 'forbidden' && <p className={`card-layer passcode ${this.props.card.frame === 'xyz' ? 'white' : 'black'}-text`}>{this.props.card.passcode}</p>}

      <p className={`card-layer card-set ${this.props.card.frame === 'xyz' ? 'white' : 'black'}-text ${this.props.card.frame === 'link' ? 'on-link' : ''} ${this.props.card.pendulum ? 'on-pendulum' : ''}`}>
        {this.props.card.cardSet}
      </p>

      {this.hasAbilities && <p className={`card-layer atk-def atk black-text`}>{this.props.card.atk}</p>}
      {this.hasAbilities && this.props.card.frame !== 'link' && <p className={`card-layer atk-def def black-text`}>{this.props.card.def}</p>}

      <img className='card-layer copyright' src={this.state.copyright} alt='copyright' />
      <img className='card-layer edition' src={this.state.edition} alt='edition' />

      {this.hasAbilities && this.renderAbilities()}
      {this.renderDescription()}
      {this.props.card.pendulum && this.renderPendulum()}
      {this.state.hasPendulumFrame && <img className='card-layer card-scale left-scale' src={this.state.leftScale} alt='leftScale' />}
      {this.state.hasPendulumFrame && <img className='card-layer card-scale right-scale' src={this.state.rightScale} alt='rightScale' />}
      {this.renderName()}

    </Container>, 'card-preview');
  }

  private renderName() {
    let className = `card-layer card-name ${this.state.defaultTextColor}-text ${this.props.card.nameStyle}`;
    if (this.props.card.frame === 'skill') {
      className = `${className} skill-name`;
    } else if (this.props.card.frame === 'link') {
      className = `${className} on-link`;
    }

    return this.renderAttributes(<HorizontalStack>
      <p className={className}>{this.props.card.name}</p>
    </HorizontalStack>, `card-layer card-name-container`);
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

    let containerClass = 'card-layer card-abilities';
    if (this.props.card.pendulum && this.props.card.frame === 'link') containerClass = `${containerClass} on-pendulum-link`;

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
    </HorizontalStack>, containerClass);
  }

  private renderPendulum() {
    return this.renderAttributes(<Container>
      <p style={{ fontSize: `${this.state.pendFontSize}px`, lineHeight: this.state.pendLineHeight }} className={`pendulum-effect-text black-text`}>
        {this.props.card.pendEffect}
      </p>
    </Container>, `card-layer card-pendulum-effect ${this.props.card.frame === 'link' ? 'on-link' : ''} ${this.state.adjustState === 'done' ? '' : 'hidden'}`);
  }

  private renderDescription() {
    let containerClass = `card-layer card-description${this.state.adjustState === 'done' ? '' : ' hidden'}`;
    if (this.hasAbilities) containerClass = `${containerClass} with-abilities`;
    if (this.props.card.pendulum && this.props.card.frame === 'link') containerClass = `${containerClass} on-pendulum-link`;

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
