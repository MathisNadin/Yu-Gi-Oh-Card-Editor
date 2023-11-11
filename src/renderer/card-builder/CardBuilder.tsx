import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import './styles.css';
import { Container } from 'libraries/mn-toolkit/container/Container';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { CSSProperties, Fragment } from 'react';
import html2canvas from 'html2canvas';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { classNames, debounce, getCroppedArtworkBase64, isEmpty } from 'libraries/mn-tools';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { ICard } from 'renderer/card/card-interfaces';

interface ICardBuilderProps extends IContainableProps {
  forRender?: boolean;
  id: string;
  card: ICard;
  onCardReady: () => void;
}

type TAdjustState = 'waiting' | 'todo' | 'name' | 'atk' | 'def' | 'pend' | 'abilities' | 'desc' | 'done';

interface ICardBuilderState extends IContainableState {
  adjustState: TAdjustState;
  adjustTextState: 'unknown' | 'tooBig' | 'tooSmall';

  usePendulumFrame: boolean;
  withLinkArrows: boolean;

  border: string;
  artworkBg: string;
  croppedArtworkBase64: string;

  cardFrames: string[];
  pendulumCovers: string[];
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
  description: JSX.Element[][];
  pendFontSize: number;
  pendLineHeight: number;
  pendEffect: JSX.Element[][];

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

export class CardBuilder extends Containable<ICardBuilderProps, ICardBuilderState> {
  private ref: HTMLDivElement | undefined;
  private debouncedRefreshState: (card: ICard) => void;

  public constructor(props: ICardBuilderProps) {
    super(props);
    this.state = {} as ICardBuilderState;
    this.debouncedRefreshState = debounce((card: ICard) => app.$errorManager.handlePromise(this.refreshState(card)), 500);
    if (!props.forRender) this.handleResize = this.handleResize.bind(this);
  }

  public componentWillReceiveProps(nextProps: ICardBuilderProps, _prevState: ICardBuilderState) {
    this.setState({ adjustState: 'waiting' });
    app.$errorManager.handlePromise(this.debouncedRefreshState(nextProps.card));
  }

  public componentDidMount() {
    if (!this.props.forRender) window.addEventListener('resize', this.handleResize);
    app.$errorManager.handlePromise(this.debouncedRefreshState(this.props.card));
  }

  public componentDidUpdate() {
    app.$errorManager.handlePromise(this.adjustAllFontSizes());
  }

  public componentWillUnmount() {
    if (!this.props.forRender) window.removeEventListener('resize', this.handleResize);
  }

  private handleResize() {
    app.$errorManager.handlePromise(this.adjustAllFontSizes());
  }

  private async refreshState(card: ICard) {
    if (!card) return;

    const copyrightPath = `${card.oldCopyright ? '1996' : '2020'}/${(!card.pendulum && card.frames.includes('xyz')) || card.frames.includes('skill') ? 'white' : 'black'}`;
    const usePendulumFrame = app.$card.hasPendulumFrame(card);

    const artworkBg = require(`../resources/pictures/whiteArtwork${usePendulumFrame ? `Pendulum${card.frames.includes('link') ? 'Link' : ''}` : '' }.png`);
    let croppedArtworkBase64: string;

    let artworkExists = false;
    if (!isEmpty(card.artwork.url)) {
      artworkExists = await window.electron.ipcRenderer.checkFileExists(card.artwork.url);
    }

    if (artworkExists) {
      croppedArtworkBase64 = `file://${card.artwork.url}`;
      croppedArtworkBase64 = await window.electron.ipcRenderer.createImgFromPath(card.artwork.url);
      croppedArtworkBase64 = await getCroppedArtworkBase64(croppedArtworkBase64, {
        x: card.artwork.x,
        y: card.artwork.y,
        height: card.artwork.height,
        width: card.artwork.width,
        unit: '%'
      });
    } else {
      croppedArtworkBase64 = artworkBg;
    }

    let cardFrames: string[] = [];
    let pendulumCovers: string[] = [];
    let includesLink = false;

    for (let frame of card.frames) {
      cardFrames.push(require(`../resources/pictures/card-frames/${frame}.png`));

      if (frame === 'link') {
        includesLink = true;
      }

      if (usePendulumFrame) {
        pendulumCovers.push(require(`../resources/pictures/pendulum-covers/${frame}.png`));
      } else if (!pendulumCovers.length) {
        pendulumCovers.push(require(`../resources/pictures/pendulum-covers/normal.png`));
      }
    }

    let pendulumFrame: string;
    if (includesLink) {
      pendulumFrame = require(`../resources/pictures/pendulum-frames/link.png`);
    } else {
      pendulumFrame = require(`../resources/pictures/pendulum-frames/regular.png`);
    }

    const state: ICardBuilderState = {
      loaded: true,
      adjustState: 'todo',
      adjustTextState: 'unknown',

      usePendulumFrame,
      withLinkArrows: app.$card.hasLinkArrows(card),

      border: require('../resources/pictures/squareBorders.png'),
      artworkBg,
      croppedArtworkBase64,

      cardFrames,
      pendulumCovers,
      pendulumFrame,

      linkArrowT: require(`../resources/pictures/link-arrows/top${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowB: require(`../resources/pictures/link-arrows/bottom${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowL: require(`../resources/pictures/link-arrows/left${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowR: require(`../resources/pictures/link-arrows/right${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowTL: require(`../resources/pictures/link-arrows/topLeft${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowTR: require(`../resources/pictures/link-arrows/topRight${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowBL: require(`../resources/pictures/link-arrows/bottomLeft${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowBR: require(`../resources/pictures/link-arrows/bottomRight${usePendulumFrame ? 'Pendulum' : ''}.png`),

      descFontSize: 30,
      descLineHeight: 1.2,
      description: card.description.split('\n').map(d => this.getProcessedText(d)),
      pendFontSize: 30,
      pendLineHeight: 1.2,
      pendEffect: card.pendEffect.split('\n').map(d => this.getProcessedText(d)),

      attribute: require(`../resources/pictures/attributes/${card.noTextAttribute ? 'vanilla' : card.language}/${card.attribute}.png`),
      level: require(`../resources/pictures/levels/${card.level}.png`),
      negativeLevel: require(`../resources/pictures/negative-levels/${card.level}.png`),
      rank: require(`../resources/pictures/ranks/${card.level}.png`),
      linkRating: require(`../resources/pictures/link-ratings/${card.level}.png`),
      spellPlus: require(`../resources/pictures/st/${card.language}/spell+.png`),
      trapPlus: require(`../resources/pictures/st/${card.language}/trap+.png`),
      stIcon: require(`../resources/pictures/st/${card.language}/${card.stType}${card.stType === 'normal' ? card.frames.includes('spell') ? '-spell' : '-trap' : '' }.png`),
      leftScale: require(`../resources/pictures/pendulum-scales/${includesLink ? 'L_' : ''}G_${card.scales.left}.png`),
      rightScale: require(`../resources/pictures/pendulum-scales/${includesLink ? 'L_' : ''}D_${card.scales.right}.png`),

      atkDefLine: require(`../resources/pictures/atkDefLine.png`),
      atkLinkLine: require(`../resources/pictures/atkLinkLine.png`),
      sticker: require(`../resources/pictures/stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
      copyright: require(`../resources/pictures/limitations/${card.language}/${copyrightPath}/copyright.png`),
      edition: require(`../resources/pictures/limitations/${card.language}/${copyrightPath}/${card.edition === 'unlimited' ? 'limited' : card.edition}.png`),
    };

    this.setState(state);
  }

  private getProcessedText(text: string) {
    const parts = text.split(/(●|•)/).map(part => part.trim());
    if (parts.length && !parts[0]) parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];
    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        let classes = classNames('span-text', { 'with-bullet-point': nextHasBullet, 'in-middle': i > 1 });
        nextHasBullet = false;
        processedText.push(<span className={classes}>{part}</span>);
      }
    });

    return processedText;
  }

  private async adjustAllFontSizes() {
    switch (this.state?.adjustState) {
      case 'todo': this.setState({ adjustState: 'name' }); break;
      case 'name': await this.convertNameToImg(); break;
      case 'atk': this.convertAtkToImg(); break;
      case 'def': this.convertDefToImg(); break;
      case 'pend': this.adjustPendFontSize(); break;
      case 'abilities': await this.convertAbilitiesToImg(); break;
      case 'desc': this.adjustDescFontSize(); break;
      case 'done': if (this.props.onCardReady) this.props.onCardReady(); break;
      default: break;
    }
  }

  public async convertNameToImg() {
    const container = this.ref?.querySelector('.card-name-container') as HTMLDivElement;
    if (!container) return;

    const name = container.querySelector('.card-name') as HTMLDivElement;
    if (!name) return;

    if (this.props.card.frames.includes('skill')) {
      name.style.width = `${name.scrollWidth + 6}px`;
      name.style.height = `${name.scrollHeight + 3}px`;
    } else {
      name.style.width = '';
      name.style.height = '';
    }

    const canvas = await html2canvas(name, { backgroundColor: null });
    canvas.className = 'html2canvas-name';
    const existingCanvas = container.querySelector('.html2canvas-name');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      container.appendChild(canvas);
    }
    this.setState({ adjustState: 'atk' });
  }

  public async convertAtkToImg() {
    if (app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill')) {
      const container = this.ref?.querySelector('.atk') as HTMLDivElement;
      if (!container) return;
      const atk = container.querySelector('.atk-text') as HTMLParagraphElement;
      if (!atk) return;

      const canvas = await html2canvas(atk, { backgroundColor: null });
      canvas.className = 'html2canvas html2canvas-atk';
      const existingCanvas = container.querySelector('.html2canvas-atk');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
    }
    this.setState({ adjustState: 'def' });
  }

  public async convertDefToImg() {
    if (app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill') && !this.props.card.frames.includes('link')) {
      const container = this.ref?.querySelector('.def') as HTMLDivElement;
      if (!container) return;
      const def = container.querySelector('.def-text') as HTMLParagraphElement;
      if (!def) return;

      const canvas = await html2canvas(def, { backgroundColor: null });
      canvas.className = 'html2canvas html2canvas-def';
      const existingCanvas = container.querySelector('.html2canvas-def');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
    }
    this.setState({ adjustState: 'pend' });
  }

  public async convertAbilitiesToImg() {
    if (!app.$card.hasAbilities(this.props.card)) {
      this.setState({ adjustState: 'desc' });
      return;
    }

    const container = this.ref?.querySelector('.card-abilities') as HTMLDivElement;
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

  private adjustPendFontSize() {
    if (!app.$card.hasPendulumFrame(this.props.card)) {
      this.setState({ adjustState: 'abilities' });
      return;
    }

    const container = this.ref?.querySelector('.card-pendulum-effect-holder') as HTMLDivElement;
    const texts = this.ref?.querySelectorAll('.pendulum-effect-text') as NodeListOf<HTMLDivElement>;
    if (!container || !texts?.length || this.state.pendFontSize === 0) {
      this.setState({ adjustState: 'abilities' });
      return;
    }

    let textHeight = 0;
    let textWidth = 0;
    textWidth = texts[0].clientWidth;
    texts.forEach(text => {
      textHeight += text.clientHeight;
    });
    const parentHeight = container.clientHeight;
    const parentWidth = container.clientWidth;
    const fontSize = this.state.pendFontSize;

    if (textHeight > parentHeight || textWidth > parentWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 5) {
        this.setState({ pendFontSize: newFontSize, pendLineHeight: newLineHeight, adjustTextState: 'tooBig' });
      } else {
        this.setState({ adjustState: 'abilities', adjustTextState: 'unknown' });
      }
    }
    else if (textHeight < parentHeight || textWidth < parentWidth) {
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

        if (newFontSize <= 30) {
          this.setState({ pendFontSize: newFontSize, pendLineHeight: newLineHeight, adjustTextState: 'tooSmall' });
        } else {
          this.setState({ adjustState: 'abilities', adjustTextState: 'unknown' });
        }
      }
    }
    else {
      this.setState({ adjustState: 'abilities', adjustTextState: 'unknown' });
    }
  }

  public adjustDescFontSize() {
    const container = this.ref?.querySelector('.card-description-holder') as HTMLDivElement;
    const texts = this.ref?.querySelectorAll('.description-text') as NodeListOf<HTMLDivElement>;
    if (!container || !texts?.length || this.state.descFontSize === 0) {
      this.setState({ adjustState: 'done' });
      return;
    }

    let textHeight = 0;
    let textWidth = 0;
    textWidth = texts[0].clientWidth;
    texts.forEach(text => {
      textHeight += text.clientHeight;
    });
    const parentHeight = container.clientHeight;
    const parentWidth = container.clientWidth;
    const fontSize = this.state.descFontSize;

    if (textHeight > parentHeight || textWidth > parentWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 5) {
        this.setState({ descFontSize: newFontSize, descLineHeight: newLineHeight, adjustTextState: 'tooBig' });
      } else {
        this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
      }
    }
    else if (textHeight < parentHeight || textWidth < parentWidth) {
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

        if (newFontSize <= 30) {
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

  private getFramesStylesArray(num: number): string[] {
    const array: number[] = [];
    let sum = 0;
    let middleIndex: number;

    if (num % 2 === 0) {
      middleIndex = num / 2;
      for (let i = 1; i <= middleIndex; i++) {
        const distanceFromMiddle = i - 0.5;
        const multiplier = 1.4 ** (middleIndex - distanceFromMiddle);
        const value = multiplier * 100 / ((1.4 ** middleIndex) * 2 - 1);
        array.unshift(value); // Ajouter à gauche
        array.push(value); // Ajouter à droite
        sum += 2 * value;
      }
    } else {
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
    }

    const scaleFactor = 100 / sum;
    let add = 0;
    const scaledArray = array.map((value, index) => {
      let stringValue: string;
      if (!index) {
        stringValue = `0%`;
      } else {
        stringValue = `${add * scaleFactor}%`;
      }
      add+=value;
      return stringValue;
    });
    return scaledArray;
  }

  public render() {
    if (!this.props.card) return <div></div>;

    if (!this.state?.loaded) return <Spinner />;

    let artworkClass = 'card-layer artwork-container';
    if (app.$card.hasPendulumFrame(this.props.card)) {
      if (this.props.card.frames.includes('link')) {
        artworkClass = `${artworkClass} artwork-pendulum-link`;
      } else {
        artworkClass = `${artworkClass} artwork-pendulum`;
      }

      if (this.props.card.artwork.pendulum) {
        artworkClass = `${artworkClass} in-pendulum-effect`;
      }
    }

    return this.renderAttributes(<Container id={this.props.id} ref={() => this.ref = document.getElementById(this.props.id) as HTMLDivElement}>
      <img className='card-layer border' src={this.state.border} alt='border' />

      {this.state.usePendulumFrame && this.renderFrames(this.state.cardFrames, 'card-frame')}
      <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
      {this.renderAttributes(<div><img className='artwork' src={this.state.croppedArtworkBase64} alt='artwork' /></div>, artworkClass)}

      {!this.state.usePendulumFrame && this.renderFrames(this.state.cardFrames, 'card-frame')}
      {this.state.usePendulumFrame && this.renderFrames(this.state.pendulumCovers, 'cover-frame')}
      {this.state.usePendulumFrame && <img className='card-layer pendulum-frame' src={this.state.pendulumFrame} alt='pendulumFrame' />}

      {!this.props.card.frames.includes('skill') && <img className='card-layer attribute' src={this.state.attribute} alt='attribute' />}
      {this.renderLevelOrStIcon()}
      {this.renderStPlus()}

      {this.state.withLinkArrows && this.renderLinkArrows()}

      {app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill') && (this.props.card.frames.includes('link')
        ? <img className='card-layer atk-link-line' src={this.state.atkLinkLine} alt='atkLinkLine' />
        : <img className='card-layer atk-def-line' src={this.state.atkDefLine} alt='atkDefLine' />)}

      {this.props.card.sticker !== 'none' && <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />}
      {this.props.card.edition !== 'forbidden' && <p className={`card-layer passcode ${(!this.props.card.pendulum && this.props.card.frames.includes('xyz')) || this.props.card.frames.includes('skill') ? 'white' : 'black'}-text`}>{this.props.card.passcode}</p>}

      <p className={`card-layer card-set ${(!this.props.card.pendulum && this.props.card.frames.includes('xyz')) || this.props.card.frames.includes('skill') ? 'white' : 'black'}-text ${app.$card.hasLinkArrows(this.props.card) ? 'with-arrows' : ''} ${app.$card.hasPendulumFrame(this.props.card) ? 'on-pendulum' : ''}`}>
        {this.props.card.cardSet}
      </p>

      {app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill')
        && <Container className={classNames('card-layer', 'atk-def', 'atk', { 'question-mark': this.props.card.atk === '?' })}>
          <p className="stat-text atk-text black-text">{this.props.card.atk}</p>
        </Container>
      }

      {app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill') && !this.props.card.frames.includes('link')
        && <Container className={classNames('card-layer', 'atk-def', 'def', { 'question-mark': this.props.card.def === '?' })}>
          <p className="stat-text def-text black-text">{this.props.card.def}</p>
        </Container>
      }

      {this.props.card.hasCopyright && <img className='card-layer copyright' src={this.state.copyright} alt='copyright' />}
      {this.props.card.edition !== 'unlimited' && <img className='card-layer edition' src={this.state.edition} alt='edition' />}

      {app.$card.hasAbilities(this.props.card) && this.renderAbilities()}
      {this.renderDescription()}
      {app.$card.hasPendulumFrame(this.props.card) && this.renderPendulum()}
      {this.state.usePendulumFrame && <img className='card-layer card-scale left-scale' src={this.state.leftScale} alt='leftScale' />}
      {this.state.usePendulumFrame && <img className='card-layer card-scale right-scale' src={this.state.rightScale} alt='rightScale' />}
      {this.renderName()}

    </Container>, 'card-builder');
  }

  private renderName() {
    let hStackClassName = `card-layer card-name-container`;
    let pClassName = `card-layer card-name ${this.props.card.nameStyle}`;
    if (this.props.card.frames.includes('skill')) {
      pClassName = `${pClassName} white-text skill-name`;
      hStackClassName = `${hStackClassName} skill-name-container`;
    } else {
      pClassName = `${pClassName} ${this.props.card.frames.includes('xyz') || this.props.card.frames.includes('link') || app.$card.isBackrow(this.props.card) ? 'white' : 'black'}-text`;
      if (this.props.card.frames.includes('link')) {
        pClassName = `${pClassName} on-link`;
      }
    }

    const specialCharsRegex = /([^a-zA-Z0-9éäöüçñàèùâêîôûÉÄÖÜÇÑÀÈÙÂÊÎÔÛ\s.,;:'"/?!+-/&"'()`_^=])/;
    const parts = this.props.card.name.split(specialCharsRegex);

    let processedText = parts.map((part, index) =>
      specialCharsRegex.test(part) ? (
        <span key={index} className="special-char-span">
          {part}
        </span>
      ) : (
        part
      )
    );

    return this.renderAttributes(<HorizontalStack>
      <p className={pClassName}>{processedText}</p>
    </HorizontalStack>, hStackClassName);
  }

  private renderFrames(frames: string[], className: string) {
    const styleArray = this.getFramesStylesArray(frames.length);
    return this.renderAttributes(<HorizontalStack>
      {frames.map((frame, index) => {
        const style: CSSProperties = {};
        if (index) style.clipPath = `polygon(100% 0%, ${styleArray[index]} 0%, 50% 50%, ${styleArray[index]} 100%, 100% 100%)`;
        return <img style={style} className={classNames('card-frame', className)} src={frame} alt={className} />;
      })}
    </HorizontalStack>, 'card-layer card-frames-container');
  }

  private renderAbilities() {
    let text = this.props.card.abilities.join(' / ');
    const upperCaseIndexes = text.split('').map((char, index) => char === char.toUpperCase() ? index : -1).filter(i => i !== -1);
    const lowerCaseText = text.toLowerCase();
    let firstIndexLowerCase: boolean;
    if (!upperCaseIndexes.includes(0)) {
      upperCaseIndexes.unshift(0);
      firstIndexLowerCase = true;
    }

    let containerClass = 'card-layer card-abilities';
    if (app.$card.hasPendulumFrame(this.props.card) && this.props.card.frames.includes('link')) containerClass = `${containerClass} on-pendulum-link`;

    return this.renderAttributes(<HorizontalStack>
      <p className="abilities-text black-text abilities-bracket left-bracket">[</p>
      <p className="abilities-text black-text abilities">
        {upperCaseIndexes.map((index, i) => (
          <Fragment key={`uppercase-index-${i}`}>
            <span className={i === 0 && firstIndexLowerCase ? 'lowercase' : 'uppercase'}>
              {text.slice(index, index+1)}
            </span>
            <span className='lowercase'>
              {lowerCaseText.slice(index+1, upperCaseIndexes[i+1] || text.length)}
            </span>
          </Fragment>
        ))}
      </p>
      <p className="abilities-text black-text abilities-bracket right-bracket">]</p>
    </HorizontalStack>, containerClass);
  }

  private renderPendulum() {
    return this.renderAttributes(<VerticalStack>
      {this.state.pendEffect.map(text => {
        return <p
          className='pendulum-effect-text black-text'
          style={{
            fontSize: `${this.state.pendFontSize}px`,
            lineHeight: this.state.pendLineHeight,
            marginBottom: this.state.pendLineHeight / 2
          }}>{text}</p>;
        })}
    </VerticalStack>, `card-layer card-pendulum-effect-holder ${this.props.card.frames.includes('link') ? 'on-link' : ''} ${this.state.adjustState === 'done' ? '' : 'hidden'}`);
  }

  private renderDescription() {
    let containerClass = `card-layer card-description-holder${this.state.adjustState === 'done' ? '' : ' hidden'}`;
    if (app.$card.hasAbilities(this.props.card)) {
      containerClass = `${containerClass} with-abilities`;

      if (this.props.card.frames.includes('skill')) {
        containerClass = `${containerClass} on-skill`;
      }
    }
    if (this.props.card.frames.includes('normal')) containerClass = `${containerClass} normal-text`;
    if (app.$card.hasPendulumFrame(this.props.card) && this.props.card.frames.includes('link')) containerClass = `${containerClass} on-pendulum-link`;

    return this.renderAttributes(<VerticalStack>
      {this.state.description.map(d => {
        return <p
          className='description-text black-text'
          style={{
            fontSize: `${this.state.descFontSize}px`,
            lineHeight: this.state.descLineHeight,
            marginBottom: this.state.descLineHeight / 2
          }}>{d}</p>;
        })}
    </VerticalStack>, containerClass);
  }

  private renderStPlus() {
    if (app.$card.isBackrow(this.props.card) && this.props.card.stType !== 'normal' && this.props.card.stType !== 'link') {
      return <img className='card-layer st-plus' src={this.props.card.frames.includes('spell') ? this.state.spellPlus : this.state.trapPlus} alt='stPlus' />;
    }
    return null;
  }

  private renderLevelOrStIcon() {
    let includesOther = false;
    let includesXyz = false;
    let includesDarkSynchro = false;
    let includesLink = false;

    for (let frame of this.props.card.frames) {
      if (frame === 'spell' || frame === 'trap') {
        return <img className='card-layer st-icon' src={this.state.stIcon} alt='stIcon' />;
      } else if (frame === 'link') {
        includesLink = true;
      } else if (frame === 'xyz') {
        includesXyz = true;
      } else if (frame === 'darkSynchro') {
        includesDarkSynchro = true;
      } else {
        includesOther = true;
      }
    }

    if (includesLink) {
      return <img className='card-layer link-rating' src={this.state.linkRating} alt='linkRating' />;
    }
    else if (includesOther) {
      return <img className='card-layer level' src={this.state.level} alt='level' />;
    }
    else if (includesDarkSynchro) {
      return <img className='card-layer negative-level' src={this.state.negativeLevel} alt='negativeLevel' />;
    }
    else if (includesXyz) {
      return <img className='card-layer rank' src={this.state.rank} alt='rank' />;
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
