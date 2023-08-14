/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
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
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { CSSProperties, Fragment } from 'react';
import html2canvas from 'html2canvas';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { classNames, debounce, getCroppedArtworkBase64, isEmpty } from 'mn-toolkit/tools';
import { Spinner } from 'mn-toolkit/spinner/Spinner';
import { ICard } from 'renderer/card/card-interfaces';

interface IRushCardBuilderProps extends IContainableProps {
  forRender?: boolean;
  id: string;
  card: ICard;
  onCardReady: () => void;
}

type TAdjustState = 'waiting' | 'todo' | 'name' | 'atk' | 'def' | 'abilities' | 'desc' | 'done';

interface IRushCardBuilderState extends IContainableState {
  adjustState: TAdjustState;
  adjustTextState: 'unknown' | 'tooBig' | 'tooSmall';

  artworkBg: string;
  croppedArtworkBase64: string;

  cardFrames: string[];

  descFontSize: number;
  descLineHeight: number;
  pendFontSize: number;
  pendLineHeight: number;

  legend: string;
  attribute: string;
  levelStar: string;
  level: string;
  rankStar: string;
  rank: string;
  stIcon: string;

  atkDefLine: string;
  atkMaxLine: string;
  sticker: string;
  copyright: string;
  edition: string;
}

export class RushCardBuilder extends Containable<IRushCardBuilderProps, IRushCardBuilderState> {
  private ref: HTMLDivElement | undefined;
  private debouncedRefreshState: (card: ICard) => void;

  public constructor(props: IRushCardBuilderProps) {
    super(props);
    this.state = {} as IRushCardBuilderState;
    this.debouncedRefreshState = debounce((card: ICard) => app.$errorManager.handlePromise(this.refreshState(card)), 500);
    if (!props.forRender) this.handleResize = this.handleResize.bind(this);
  }

  public componentWillReceiveProps(nextProps: IRushCardBuilderProps, _prevState: IRushCardBuilderState) {
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

    const artworkBg = require(`../resources/pictures/rdWhiteArtwork.png`);
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

    for (let frame of card.frames) {
      cardFrames.push(require(`../resources/pictures/rd-card-frames/${frame}.png`));
    }

    const state: IRushCardBuilderState = {
      loaded: true,
      adjustState: 'todo',
      adjustTextState: 'unknown',

      artworkBg,
      croppedArtworkBase64,

      cardFrames,

      descFontSize: 30,
      descLineHeight: 1.2,
      pendFontSize: 30,
      pendLineHeight: 1.2,

      legend: require(`../resources/pictures/rd-legend/${card.legendType}.png`),
      attribute: require(`../resources/pictures/rd-attributes/${card.attribute}.png`),
      levelStar: require(`../resources/pictures/rd-levels/star.png`),
      level: require(`../resources/pictures/rd-levels/${card.level}.png`),
      rankStar: require(`../resources/pictures/rd-ranks/star.png`),
      rank: require(`../resources/pictures/rd-ranks/${card.level}.png`),
      stIcon: require(`../resources/pictures/rd-icons/st/${card.stType}.png`),

      atkDefLine: require(`../resources/pictures/rdAtkDefLine.png`),
      atkMaxLine: require(`../resources/pictures/rdAtkMaxLine.png`),
      sticker: require(`../resources/pictures/rd-stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
      copyright: require(`../resources/pictures/limitations/${card.language}/${copyrightPath}/copyright.png`),
      edition: require(`../resources/pictures/limitations/${card.language}/${copyrightPath}/${card.edition === 'unlimited' ? 'limited' : card.edition}.png`),
    };

    this.setState(state);
  }

  private async adjustAllFontSizes() {
    switch (this.state?.adjustState) {
      case 'todo': this.setState({ adjustState: 'name' }); break;
      case 'name': await this.convertNameToImg(); break;
      case 'atk': this.convertAtkToImg(); break;
      case 'def': this.convertDefToImg(); break;
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
    this.setState({ adjustState: 'abilities' });
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

    const specificties = this.getSpecifities();

    return this.renderAttributes(<Container id={this.props.id} ref={() => this.ref = document.getElementById(this.props.id) as HTMLDivElement}>
      <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
      {this.renderAttributes(<div><img className='artwork' src={this.state.croppedArtworkBase64} alt='artwork' /></div>, artworkClass)}

      {this.renderFrames(this.state.cardFrames, 'card-frame')}

      {<img className='card-layer attribute' src={this.state.attribute} alt='attribute' />}

      {app.$card.hasAbilities(this.props.card) && !this.props.card.dontCoverRushArt && this.props.card.maximum &&
        <img className='card-layer atk-max-line' src={this.state.atkMaxLine} alt='atkMaxLine' />
      }
      {app.$card.hasAbilities(this.props.card) && !this.props.card.dontCoverRushArt &&
        <img className='card-layer atk-def-line' src={this.state.atkDefLine} alt='atkDefLine' />
      }

      {specificties.lv && <img className='card-layer level-star' src={this.state.levelStar} alt='levelStar' />}
      {specificties.lv && <img className='card-layer level' src={this.state.level} alt='level' />}

      {specificties.rk && <img className='card-layer rank-star' src={this.state.rankStar} alt='rankStar' />}
      {specificties.rk && <img className='card-layer rank' src={this.state.rank} alt='rank' />}

      {specificties.st && <img className='card-layer st-icon' src={this.state.stIcon} alt='stIcon' />}

      {this.props.card.sticker !== 'none' && <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />}
      {this.props.card.edition !== 'forbidden' && <p className={`card-layer passcode ${(!this.props.card.pendulum && this.props.card.frames.includes('xyz')) || this.props.card.frames.includes('skill') ? 'white' : 'black'}-text`}>{this.props.card.passcode}</p>}

      <p className={`card-layer card-set ${(this.props.card.frames.includes('xyz')) ? 'white' : 'black'}-text`}>
        {this.props.card.cardSet}
      </p>

      {this.props.card.maximum && app.$card.hasAbilities(this.props.card) &&
        <Container className={classNames('card-layer', 'atk-def', 'atk-max', { 'question-mark': this.props.card.atkMax === '?' })}>
          <p className={`stat-text atk-max-text white-text`}>{this.props.card.atkMax}</p>
        </Container>
      }

      {app.$card.hasAbilities(this.props.card) &&
        <Container className={classNames('card-layer', 'atk-def', 'atk', { 'question-mark': this.props.card.atk === '?' })}>
          <p className={`stat-text atk-text white-text`}>{this.props.card.atk}</p>
        </Container>
      }

      {app.$card.hasAbilities(this.props.card) &&
        <Container className={classNames('card-layer', 'atk-def', 'def', { 'question-mark': this.props.card.def === '?' })}>
          <p className={`stat-text def-text white-text`}>{this.props.card.def}</p>
        </Container>
      }

      {this.props.card.hasCopyright && <img className='card-layer copyright' src={this.state.copyright} alt='copyright' />}
      {this.props.card.edition !== 'unlimited' && <img className='card-layer edition' src={this.state.edition} alt='edition' />}

      {app.$card.hasAbilities(this.props.card) && this.renderAbilities()}
      {this.renderDescription()}
      {this.renderName()}

    </Container>, 'card-builder rush-card-builder');
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

    return this.renderAttributes(<HorizontalStack>
      <p className={pClassName}>{this.props.card.name}</p>
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
      <p className={`abilities-text black-text abilities-bracket left-bracket`}>{'['}</p>
      <p className={`abilities-text black-text abilities`}>
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
      <p className={`abilities-text black-text abilities-bracket right-bracket`}>{']'}</p>
    </HorizontalStack>, containerClass);
  }

  private renderPendulum() {
    const pendEffect = this.props.card.pendEffect.split('\n');

    return this.renderAttributes(<VerticalStack>
      {pendEffect.map(text => {
        let withBulletPoint = false;
        if (text.startsWith('●')) {
          withBulletPoint = true;
          text = text.replace(/^●\s*/, '');
        }
        return <p
          className={classNames('pendulum-effect-text', 'black-text', { 'with-bullet-point': withBulletPoint })}
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
    if (this.props.card.frames.includes('normal')) containerClass = `${containerClass} normal-text`;
    if (app.$card.hasPendulumFrame(this.props.card) && this.props.card.frames.includes('link')) containerClass = `${containerClass} on-pendulum-link`;

    const description = this.props.card.description.split('\n');

    return this.renderAttributes(<VerticalStack>
      {description.map(d => {
        let withBulletPoint = false;
        if (d.startsWith('●')) {
          withBulletPoint = true;
          d = d.replace(/^●\s*/, '');
        }
        return <p
          className={classNames('description-text', 'black-text', { 'with-bullet-point': withBulletPoint })}
          style={{
            fontSize: `${this.state.descFontSize}px`,
            lineHeight: this.state.descLineHeight,
            marginBottom: this.state.descLineHeight / 2
          }}>{d}</p>;
        })}
    </VerticalStack>, containerClass);
  }

  private getSpecifities(): { lv: boolean, rk: boolean, st: boolean } {
    let includesXyz = false;

    for (let frame of this.props.card.frames) {
      if (frame === 'spell' || frame === 'trap') {
        return { lv: false, rk: false, st: true };
      } else if (frame === 'xyz') {
        includesXyz = true;
      }
    }

    if (includesXyz) {
      return { lv: false, rk: true, st: false };
    } else {
      return { lv: true, rk: false, st: false };
    }
  }
}