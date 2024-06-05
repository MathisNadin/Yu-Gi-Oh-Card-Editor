/* eslint-disable @typescript-eslint/no-var-requires */
import { CSSProperties, Fragment } from 'react';
import html2canvas from 'html2canvas';
import { classNames, debounce, getCroppedArtworkBase64, isEmpty } from 'mn-tools';
import { ICard } from 'client/editor/card/card-interfaces';
import { IContainableProps, IContainableState, Containable, Spinner } from 'mn-toolkit';

interface ICardBuilderProps extends IContainableProps {
  forRender?: boolean;
  id: string;
  renderId: string;
  card: ICard;
  onCardReady: () => void;
}

type TAdjustState = 'waiting' | 'todo' | 'done';

type TAdjustTextState = 'unknown' | 'tooBig' | 'tooSmall';

interface ICardBuilderState extends IContainableState {
  adjustDescTextState: TAdjustTextState;
  adjustPendTextState: TAdjustTextState;

  nameDone: boolean;
  atkDone: boolean;
  defDone: boolean;
  pendDone: boolean;
  abilitiesDone: boolean;
  descDone: boolean;

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
  private adjustState: TAdjustState = 'waiting';
  private ref: HTMLDivElement | undefined;
  private debouncedRefreshState: (resetFontSizes: boolean) => void;

  public constructor(props: ICardBuilderProps) {
    super(props);
    this.debouncedRefreshState = debounce(
      (resetFontSizes: boolean) => app.$errorManager.handlePromise(this.refreshState(resetFontSizes)),
      500
    );
    if (!props.forRender) this.handleResize = this.handleResize.bind(this);
  }

  public componentDidMount() {
    if (!this.props.forRender) window.addEventListener('resize', this.handleResize);
    app.$errorManager.handlePromise(this.debouncedRefreshState(true));
  }

  public componentDidUpdate(prevProps: ICardBuilderProps) {
    if (prevProps.renderId !== this.props.renderId) {
      this.adjustState = 'waiting';
      this.debouncedRefreshState(prevProps.card !== this.props.card);
    } else if (this.adjustState === 'todo') {
      app.$errorManager.handlePromise(this.adjustAllFontSizes());
    } else if (this.adjustState === 'done') {
      this.adjustState = 'waiting';
      setTimeout(() => this.props.onCardReady());
    }
  }

  public componentWillUnmount() {
    if (!this.props.forRender) window.removeEventListener('resize', this.handleResize);
  }

  private handleResize() {
    this.adjustState = 'todo';
    app.$errorManager.handlePromise(this.adjustAllFontSizes());
  }

  private async refreshState(resetFontSizes: boolean) {
    const { card } = this.props;
    if (!card) return;

    let { descFontSize, descLineHeight, pendFontSize, pendLineHeight } = this.state;
    if (resetFontSizes) {
      descFontSize = 30;
      descLineHeight = 1.2;
      pendFontSize = 30;
      pendLineHeight = 1.2;
    }

    const copyrightPath = `${card.oldCopyright ? '1996' : '2020'}/${(!card.pendulum && card.frames.includes('xyz')) || card.frames.includes('skill') ? 'white' : 'black'}`;
    const usePendulumFrame = app.$card.hasPendulumFrame(card);

    const artworkBg = require(
      `../../../assets/images/whiteArtwork${usePendulumFrame ? `Pendulum${card.frames.includes('link') ? 'Link' : ''}` : ''}.png`
    );
    let croppedArtworkBase64: string;

    let artworkExists = false;
    if (!isEmpty(card.artwork.url) && app.$device.isDesktop) {
      try {
        artworkExists = await window.electron.ipcRenderer.checkFileExists(card.artwork.url);
      } catch (error) {
        console.error(error);
      }
    }

    if (artworkExists) {
      croppedArtworkBase64 = `file://${card.artwork.url}`;
      try {
        croppedArtworkBase64 = await window.electron.ipcRenderer.createImgFromPath(card.artwork.url);
        croppedArtworkBase64 = await getCroppedArtworkBase64(croppedArtworkBase64, {
          x: card.artwork.x,
          y: card.artwork.y,
          height: card.artwork.height,
          width: card.artwork.width,
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      croppedArtworkBase64 = artworkBg;
    }

    let cardFrames: string[] = [];
    let pendulumCovers: string[] = [];
    let includesLink = false;

    for (const frame of card.frames) {
      cardFrames.push(require(`../../../assets/images/card-frames/${frame}.png`));

      if (frame === 'link') {
        includesLink = true;
      }

      if (usePendulumFrame) {
        pendulumCovers.push(require(`../../../assets/images/pendulum-covers/${frame}.png`));
      } else if (!pendulumCovers.length) {
        pendulumCovers.push(require(`../../../assets/images/pendulum-covers/normal.png`));
      }
    }

    let pendulumFrame: string;
    if (includesLink) {
      pendulumFrame = require(`../../../assets/images/pendulum-frames/link.png`);
    } else {
      pendulumFrame = require(`../../../assets/images/pendulum-frames/regular.png`);
    }

    const state: ICardBuilderState = {
      loaded: true,
      adjustDescTextState: 'unknown',
      adjustPendTextState: 'unknown',

      nameDone: false,
      atkDone: false,
      defDone: false,
      pendDone: false,
      abilitiesDone: false,
      descDone: false,

      usePendulumFrame,
      withLinkArrows: app.$card.hasLinkArrows(card),

      border: require('assets/images/squareBorders.png'),
      artworkBg,
      croppedArtworkBase64,

      cardFrames,
      pendulumCovers,
      pendulumFrame,

      linkArrowT: require(`../../../assets/images/link-arrows/top${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowB: require(`../../../assets/images/link-arrows/bottom${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowL: require(`../../../assets/images/link-arrows/left${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowR: require(`../../../assets/images/link-arrows/right${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowTL: require(`../../../assets/images/link-arrows/topLeft${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowTR: require(`../../../assets/images/link-arrows/topRight${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowBL: require(`../../../assets/images/link-arrows/bottomLeft${usePendulumFrame ? 'Pendulum' : ''}.png`),
      linkArrowBR: require(`../../../assets/images/link-arrows/bottomRight${usePendulumFrame ? 'Pendulum' : ''}.png`),

      descFontSize,
      descLineHeight,
      description: card.description.split('\n').map((d, i) => this.getProcessedText(d, i)),
      pendFontSize,
      pendLineHeight,
      pendEffect: card.pendEffect.split('\n').map((d, i) => this.getProcessedText(d, i)),

      attribute: require(
        `../../../assets/images/attributes/${card.noTextAttribute ? 'vanilla' : card.language}/${card.attribute}.png`
      ),
      level: require(`../../../assets/images/levels/${card.level}.png`),
      negativeLevel: require(`../../../assets/images/negative-levels/${card.level}.png`),
      rank: require(`../../../assets/images/ranks/${card.level}.png`),
      linkRating: require(`../../../assets/images/link-ratings/${card.level}.png`),
      spellPlus: require(`../../../assets/images/st/${card.language}/spell+.png`),
      trapPlus: require(`../../../assets/images/st/${card.language}/trap+.png`),
      stIcon: require(
        `../../../assets/images/st/${card.language}/${card.stType}${card.stType === 'normal' ? (card.frames.includes('spell') ? '-spell' : '-trap') : ''}.png`
      ),
      leftScale: require(`../../../assets/images/pendulum-scales/${includesLink ? 'L_' : ''}G_${card.scales.left}.png`),
      rightScale: require(
        `../../../assets/images/pendulum-scales/${includesLink ? 'L_' : ''}D_${card.scales.right}.png`
      ),

      atkDefLine: require(`../../../assets/images/atkDefLine.png`),
      atkLinkLine: require(`../../../assets/images/atkLinkLine.png`),
      sticker: require(`../../../assets/images/stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
      copyright: require(`../../../assets/images/limitations/${card.language}/${copyrightPath}/copyright.png`),
      edition: require(
        `../../../assets/images/limitations/${card.language}/${copyrightPath}/${card.edition === 'unlimited' ? 'limited' : card.edition}.png`
      ),
    };

    this.adjustState = 'todo';
    this.setState(state);
  }

  private getProcessedText(text: string, index: number) {
    const parts = text.split(/(●|•)/).map((part) => part.trim());
    if (parts.length && !parts[0]) parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];
    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        let classes = classNames('span-text', { 'with-bullet-point': nextHasBullet, 'in-middle': i > 1 });
        nextHasBullet = false;
        processedText.push(
          <span key={`processed-text-${index}-${i}`} className={classes}>
            {part}
          </span>
        );
      }
    });

    return processedText;
  }

  private async adjustAllFontSizes() {
    if (this.adjustState !== 'todo') return;

    let {
      nameDone,
      atkDone,
      defDone,
      abilitiesDone,
      pendDone,
      adjustPendTextState,
      pendFontSize,
      pendLineHeight,
      descDone,
      adjustDescTextState,
      descFontSize,
      descLineHeight,
    } = this.state;

    if (!nameDone) {
      nameDone = await this.convertNameToImg();
    }

    if (!atkDone) {
      atkDone = await this.convertAtkToImg();
    }

    if (!defDone) {
      defDone = await this.convertDefToImg();
    }

    if (!abilitiesDone) {
      abilitiesDone = await this.convertAbilitiesToImg();
    }

    if (!pendDone) {
      const response = this.adjustPendFontSize();
      pendDone = response.pendDone;
      adjustPendTextState = response.adjustPendTextState;
      pendFontSize = response.pendFontSize;
      pendLineHeight = response.pendLineHeight;
    }

    if (!descDone) {
      const response = this.adjustDescFontSize();
      descDone = response.descDone;
      adjustDescTextState = response.adjustDescTextState;
      descFontSize = response.descFontSize;
      descLineHeight = response.descLineHeight;
    }

    if (nameDone && atkDone && defDone && abilitiesDone && pendDone && descDone) {
      this.adjustState = 'done';
    }

    this.setState({
      nameDone,
      atkDone,
      defDone,
      abilitiesDone,
      pendDone,
      adjustPendTextState,
      pendFontSize,
      pendLineHeight,
      descDone,
      adjustDescTextState,
      descFontSize,
      descLineHeight,
    });
  }

  public async convertNameToImg(): Promise<boolean> {
    const container = this.ref?.querySelector('.card-name-container') as HTMLDivElement;
    if (!container) return true;

    const name = container.querySelector('.card-name') as HTMLDivElement;
    if (!name) return true;

    if (this.props.card.frames.includes('skill')) {
      name.style.width = `${name.scrollWidth + 6}px`;
      name.style.height = `${name.scrollHeight + 3}px`;
    } else {
      name.style.width = '';
      name.style.height = '';
    }

    const canvas = await html2canvas(name, { backgroundColor: null, allowTaint: true });
    canvas.className = 'html2canvas-name';
    const existingCanvas = container.querySelector('.html2canvas-name');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      container.appendChild(canvas);
    }
    return true;
  }

  public async convertAtkToImg(): Promise<boolean> {
    if (app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill')) {
      const container = this.ref?.querySelector('.atk') as HTMLDivElement;
      if (!container) return true;

      const atk = container.querySelector('.atk-text') as HTMLParagraphElement;
      if (!atk) return true;

      const canvas = await html2canvas(atk, { backgroundColor: null, allowTaint: true });
      canvas.className = 'html2canvas html2canvas-atk';
      const existingCanvas = container.querySelector('.html2canvas-atk');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
    }
    return true;
  }

  public async convertDefToImg(): Promise<boolean> {
    if (
      app.$card.hasAbilities(this.props.card) &&
      !this.props.card.frames.includes('skill') &&
      !this.props.card.frames.includes('link')
    ) {
      const container = this.ref?.querySelector('.def') as HTMLDivElement;
      if (!container) return true;

      const def = container.querySelector('.def-text') as HTMLParagraphElement;
      if (!def) return true;

      const canvas = await html2canvas(def, { backgroundColor: null, allowTaint: true });
      canvas.className = 'html2canvas html2canvas-def';
      const existingCanvas = container.querySelector('.html2canvas-def');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
    }
    return true;
  }

  public async convertAbilitiesToImg(): Promise<boolean> {
    if (!app.$card.hasAbilities(this.props.card)) return true;

    const container = this.ref?.querySelector('.card-abilities') as HTMLDivElement;
    if (!container) return true;

    const rightBracket = container.querySelector('.right-bracket') as HTMLDivElement;
    const abilities = container.querySelector('.abilities') as HTMLDivElement;
    if (!rightBracket || !abilities) return true;

    const canvas = await html2canvas(abilities, { backgroundColor: null, allowTaint: true });
    canvas.className = 'html2canvas-abilities';
    const existingCanvas = container.querySelector('.html2canvas-abilities');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      container.insertBefore(canvas, rightBracket);
    }
    return true;
  }

  private adjustPendFontSize(): {
    pendDone: boolean;
    adjustPendTextState: TAdjustTextState;
    pendFontSize: number;
    pendLineHeight: number;
  } {
    if (!app.$card.hasPendulumFrame(this.props.card)) {
      return {
        pendDone: true,
        adjustPendTextState: 'unknown',
        pendFontSize: this.state.pendFontSize,
        pendLineHeight: this.state.pendLineHeight,
      };
    }

    const container = this.ref?.querySelector('.card-pendulum-effect-holder') as HTMLDivElement;
    const texts = this.ref?.querySelectorAll('.pendulum-effect-text') as NodeListOf<HTMLDivElement>;
    if (!container || !texts?.length || this.state.pendFontSize === 0) {
      return {
        pendDone: true,
        adjustPendTextState: 'unknown',
        pendFontSize: this.state.pendFontSize,
        pendLineHeight: this.state.pendLineHeight,
      };
    }

    let textHeight = 0;
    let textWidth = 0;
    textWidth = texts[0].clientWidth;
    texts.forEach((text) => {
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
        return {
          pendDone: false,
          adjustPendTextState: 'tooBig',
          pendFontSize: newFontSize,
          pendLineHeight: newLineHeight,
        };
      } else {
        return {
          pendDone: true,
          adjustPendTextState: 'unknown',
          pendFontSize: this.state.pendFontSize,
          pendLineHeight: this.state.pendLineHeight,
        };
      }
    } else if (textHeight < parentHeight || textWidth < parentWidth) {
      if (this.state.adjustPendTextState === 'tooBig') {
        if (this.state.pendLineHeight < 1.2) {
          let newLineHeight = this.state.pendLineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          return {
            pendDone: false,
            adjustPendTextState: this.state.adjustPendTextState,
            pendFontSize: this.state.pendFontSize,
            pendLineHeight: newLineHeight,
          };
        } else {
          return {
            pendDone: true,
            adjustPendTextState: 'unknown',
            pendFontSize: this.state.pendFontSize,
            pendLineHeight: this.state.pendLineHeight,
          };
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 30) {
          return {
            pendDone: false,
            adjustPendTextState: 'tooSmall',
            pendFontSize: newFontSize,
            pendLineHeight: newLineHeight,
          };
        } else {
          return {
            pendDone: true,
            adjustPendTextState: 'unknown',
            pendFontSize: this.state.pendFontSize,
            pendLineHeight: this.state.pendLineHeight,
          };
        }
      }
    } else {
      return {
        pendDone: true,
        adjustPendTextState: 'unknown',
        pendFontSize: this.state.pendFontSize,
        pendLineHeight: this.state.pendLineHeight,
      };
    }
  }

  public adjustDescFontSize(): {
    descDone: boolean;
    adjustDescTextState: TAdjustTextState;
    descFontSize: number;
    descLineHeight: number;
  } {
    const container = this.ref?.querySelector('.card-description-holder') as HTMLDivElement;
    const texts = this.ref?.querySelectorAll('.description-text') as NodeListOf<HTMLDivElement>;
    if (!container || !texts?.length || this.state.descFontSize === 0) {
      return {
        descDone: true,
        adjustDescTextState: 'unknown',
        descFontSize: this.state.descFontSize,
        descLineHeight: this.state.descLineHeight,
      };
    }

    let textHeight = 0;
    let textWidth = 0;
    textWidth = texts[0].clientWidth;
    texts.forEach((text) => {
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
        return {
          descDone: false,
          adjustDescTextState: 'tooBig',
          descFontSize: newFontSize,
          descLineHeight: newLineHeight,
        };
      } else {
        return {
          descDone: true,
          adjustDescTextState: 'unknown',
          descFontSize: this.state.descFontSize,
          descLineHeight: this.state.descLineHeight,
        };
      }
    } else if (textHeight < parentHeight || textWidth < parentWidth) {
      if (this.state.adjustDescTextState === 'tooBig') {
        if (this.state.descLineHeight < 1.2) {
          let newLineHeight = this.state.descLineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          this.setState({ descLineHeight: newLineHeight });
          return {
            descDone: false,
            adjustDescTextState: this.state.adjustDescTextState,
            descFontSize: this.state.descFontSize,
            descLineHeight: newLineHeight,
          };
        } else {
          return {
            descDone: true,
            adjustDescTextState: 'unknown',
            descFontSize: this.state.descFontSize,
            descLineHeight: this.state.descLineHeight,
          };
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 30) {
          return {
            descDone: false,
            adjustDescTextState: 'tooSmall',
            descFontSize: newFontSize,
            descLineHeight: newLineHeight,
          };
        } else {
          return {
            descDone: true,
            adjustDescTextState: 'unknown',
            descFontSize: this.state.descFontSize,
            descLineHeight: this.state.descLineHeight,
          };
        }
      }
    } else {
      return {
        descDone: true,
        adjustDescTextState: 'unknown',
        descFontSize: this.state.descFontSize,
        descLineHeight: this.state.descLineHeight,
      };
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
        const value = (multiplier * 100) / (1.4 ** middleIndex * 2 - 1);
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
          value = 1 / 1.4 ** distanceFromMiddle;
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
      add += value;
      return stringValue;
    });
    return scaledArray;
  }

  public render() {
    if (!this.props.card) return <div></div>;

    if (!this.state.loaded) return <Spinner />;

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

    return (
      <div
        className='custom-container card-builder'
        id={this.props.id}
        ref={() => (this.ref = document.getElementById(this.props.id) as HTMLDivElement)}
      >
        <img className='card-layer border' src={this.state.border} alt='border' />

        {this.state.usePendulumFrame && this.renderFrames(this.state.cardFrames, 'card-frame')}

        <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
        <div className={artworkClass}>
          <img className='artwork' src={this.state.croppedArtworkBase64} alt='artwork' />
        </div>

        {!this.state.usePendulumFrame && this.renderFrames(this.state.cardFrames, 'card-frame')}
        {this.state.usePendulumFrame && this.renderFrames(this.state.pendulumCovers, 'cover-frame')}
        {this.state.usePendulumFrame && (
          <img className='card-layer pendulum-frame' src={this.state.pendulumFrame} alt='pendulumFrame' />
        )}

        {!this.props.card.frames.includes('skill') && (
          <img className='card-layer attribute' src={this.state.attribute} alt='attribute' />
        )}
        {this.renderLevelOrStIcon()}
        {this.renderStPlus()}

        {this.state.withLinkArrows && this.renderLinkArrows()}

        {app.$card.hasAbilities(this.props.card) &&
          !this.props.card.frames.includes('skill') &&
          (this.props.card.frames.includes('link') ? (
            <img className='card-layer atk-link-line' src={this.state.atkLinkLine} alt='atkLinkLine' />
          ) : (
            <img className='card-layer atk-def-line' src={this.state.atkDefLine} alt='atkDefLine' />
          ))}

        {this.props.card.sticker !== 'none' && (
          <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />
        )}
        {this.props.card.edition !== 'forbidden' && (
          <p
            className={`card-layer passcode ${(!this.props.card.pendulum && this.props.card.frames.includes('xyz')) || this.props.card.frames.includes('skill') ? 'white' : 'black'}-text`}
          >
            {this.props.card.passcode}
          </p>
        )}

        <p
          className={`card-layer card-set ${(!this.props.card.pendulum && this.props.card.frames.includes('xyz')) || this.props.card.frames.includes('skill') ? 'white' : 'black'}-text ${app.$card.hasLinkArrows(this.props.card) ? 'with-arrows' : ''} ${app.$card.hasPendulumFrame(this.props.card) ? 'on-pendulum' : ''}`}
        >
          {this.props.card.cardSet}
        </p>

        {app.$card.hasAbilities(this.props.card) && !this.props.card.frames.includes('skill') && (
          <div
            className={classNames('custom-container', 'card-layer', 'atk-def', 'atk', {
              'question-mark': this.props.card.atk === '?',
            })}
          >
            <p className={classNames('stat-text', 'atk-text', 'black-text', { infinity: this.props.card.atk === '∞' })}>
              {this.props.card.atk}
            </p>
          </div>
        )}

        {app.$card.hasAbilities(this.props.card) &&
          !this.props.card.frames.includes('skill') &&
          !this.props.card.frames.includes('link') && (
            <div
              className={classNames('custom-container', 'card-layer', 'atk-def', 'def', {
                'question-mark': this.props.card.def === '?',
              })}
            >
              <p
                className={classNames('stat-text', 'def-text', 'black-text', { infinity: this.props.card.def === '∞' })}
              >
                {this.props.card.def}
              </p>
            </div>
          )}

        {this.props.card.hasCopyright && (
          <img className='card-layer copyright' src={this.state.copyright} alt='copyright' />
        )}
        {this.props.card.edition !== 'unlimited' && (
          <img className='card-layer edition' src={this.state.edition} alt='edition' />
        )}

        {app.$card.hasAbilities(this.props.card) && this.renderAbilities()}
        {this.renderDescription()}
        {app.$card.hasPendulumFrame(this.props.card) && this.renderPendulum()}
        {this.state.usePendulumFrame && (
          <img className='card-layer card-scale left-scale' src={this.state.leftScale} alt='leftScale' />
        )}
        {this.state.usePendulumFrame && (
          <img className='card-layer card-scale right-scale' src={this.state.rightScale} alt='rightScale' />
        )}
        {this.renderName()}
      </div>
    );
  }

  private renderName() {
    let hStackClassName = `custom-container card-layer card-name-container`;
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
        <span key={index} className='special-char-span'>
          {part}
        </span>
      ) : (
        part
      )
    );

    return (
      <div className={hStackClassName}>
        <p className={pClassName}>{processedText}</p>
      </div>
    );
  }

  private renderFrames(frames: string[], className: string) {
    const styleArray = this.getFramesStylesArray(frames.length);
    return (
      <div className='custom-container card-layer card-frames-container'>
        {frames.map((frame, index) => {
          const style: CSSProperties = {};
          if (index)
            style.clipPath = `polygon(100% 0%, ${styleArray[index]} 0%, 50% 50%, ${styleArray[index]} 100%, 100% 100%)`;
          return (
            <img
              key={`card-frame-${index}`}
              style={style}
              className={classNames('card-frame', className)}
              src={frame}
              alt={className}
            />
          );
        })}
      </div>
    );
  }

  private renderAbilities() {
    let text = this.props.card.abilities.join(' / ');
    const upperCaseIndexes = text
      .split('')
      .map((char, index) => (char === char.toUpperCase() ? index : -1))
      .filter((i) => i !== -1);
    const lowerCaseText = text.toLowerCase();
    let firstIndexLowerCase: boolean;
    if (!upperCaseIndexes.includes(0)) {
      upperCaseIndexes.unshift(0);
      firstIndexLowerCase = true;
    }

    let containerClass = 'custom-container card-layer card-abilities';
    if (app.$card.hasPendulumFrame(this.props.card) && this.props.card.frames.includes('link'))
      containerClass = `${containerClass} on-pendulum-link`;

    return (
      <div className={containerClass}>
        <p className='abilities-text black-text abilities-bracket left-bracket'>[</p>
        <p className='abilities-text black-text abilities'>
          {upperCaseIndexes.map((index, i) => (
            <Fragment key={`uppercase-index-${i}`}>
              <span className={i === 0 && firstIndexLowerCase ? 'lowercase' : 'uppercase'}>
                {text.slice(index, index + 1)}
              </span>
              <span className='lowercase'>
                {lowerCaseText.slice(index + 1, upperCaseIndexes[i + 1] || text.length)}
              </span>
            </Fragment>
          ))}
        </p>
        <p className='abilities-text black-text abilities-bracket right-bracket'>]</p>
      </div>
    );
  }

  private renderPendulum() {
    return (
      <div
        className={`custom-container vertical card-layer card-pendulum-effect-holder ${this.props.card.frames.includes('link') ? 'on-link' : ''}${this.state.pendDone ? '' : ' hidden'}`}
      >
        {this.state.pendEffect.map((text, i) => {
          return (
            <p
              key={`pendulum-effect-${i}`}
              className='pendulum-effect-text black-text'
              style={{
                fontSize: `${this.state.pendFontSize}px`,
                lineHeight: this.state.pendLineHeight,
                marginBottom: this.state.pendLineHeight / 2,
              }}
            >
              {text}
            </p>
          );
        })}
      </div>
    );
  }

  private renderDescription() {
    let containerClass = `custom-container vertical card-layer card-description-holder${this.state.descDone ? '' : ' hidden'}`;
    if (app.$card.hasAbilities(this.props.card)) {
      containerClass = `${containerClass} with-abilities`;

      if (this.props.card.frames.includes('skill')) {
        containerClass = `${containerClass} on-skill`;
      }
    }
    if (this.props.card.frames.includes('normal')) containerClass = `${containerClass} normal-text`;
    if (app.$card.hasPendulumFrame(this.props.card) && this.props.card.frames.includes('link'))
      containerClass = `${containerClass} on-pendulum-link`;

    return (
      <div className={containerClass}>
        {this.state.description.map((d, i) => {
          return (
            <p
              key={`description-text-${i}`}
              className='description-text black-text'
              style={{
                fontSize: `${this.state.descFontSize}px`,
                lineHeight: this.state.descLineHeight,
                marginBottom: this.state.descLineHeight / 2,
              }}
            >
              {d}
            </p>
          );
        })}
      </div>
    );
  }

  private renderStPlus() {
    if (
      app.$card.isBackrow(this.props.card) &&
      this.props.card.stType !== 'normal' &&
      this.props.card.stType !== 'link'
    ) {
      return (
        <img
          className='card-layer st-plus'
          src={this.props.card.frames.includes('spell') ? this.state.spellPlus : this.state.trapPlus}
          alt='stPlus'
        />
      );
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
    } else if (includesOther) {
      return <img className='card-layer level' src={this.state.level} alt='level' />;
    } else if (includesDarkSynchro) {
      return <img className='card-layer negative-level' src={this.state.negativeLevel} alt='negativeLevel' />;
    } else if (includesXyz) {
      return <img className='card-layer rank' src={this.state.rank} alt='rank' />;
    }
    return null;
  }

  private renderLinkArrows() {
    return (
      <div className='custom-container card-layer card-link-arrows'>
        {this.props.card.linkArrows.top && (
          <img
            className='card-layer link-arrow link-arrow-t'
            key='link-arrow-t'
            src={this.state.linkArrowT}
            alt='linkArrowT'
          />
        )}
        {this.props.card.linkArrows.bottom && (
          <img
            className='card-layer link-arrow link-arrow-b'
            key='link-arrow-b'
            src={this.state.linkArrowB}
            alt='linkArrowB'
          />
        )}
        {this.props.card.linkArrows.left && (
          <img
            className='card-layer link-arrow link-arrow-l'
            key='link-arrow-l'
            src={this.state.linkArrowL}
            alt='linkArrowL'
          />
        )}
        {this.props.card.linkArrows.right && (
          <img
            className='card-layer link-arrow link-arrow-r'
            key='link-arrow-r'
            src={this.state.linkArrowR}
            alt='linkArrowR'
          />
        )}
        {this.props.card.linkArrows.topLeft && (
          <img
            className='card-layer link-arrow link-arrow-tl'
            key='link-arrow-tl'
            src={this.state.linkArrowTL}
            alt='linkArrowTL'
          />
        )}
        {this.props.card.linkArrows.topRight && (
          <img
            className='card-layer link-arrow link-arrow-tr'
            key='link-arrow-tr'
            src={this.state.linkArrowTR}
            alt='linkArrowTR'
          />
        )}
        {this.props.card.linkArrows.bottomLeft && (
          <img
            className='card-layer link-arrow link-arrow-bl'
            key='link-arrow-bl'
            src={this.state.linkArrowBL}
            alt='linkArrowBL'
          />
        )}
        {this.props.card.linkArrows.bottomRight && (
          <img
            className='card-layer link-arrow link-arrow-br'
            key='link-arrow-br'
            src={this.state.linkArrowBR}
            alt='linkArrowBR'
          />
        )}
      </div>
    );
  }
}
